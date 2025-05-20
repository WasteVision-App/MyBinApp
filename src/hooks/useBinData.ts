
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MissingBinReport } from '@/types';

export const useBinData = () => {
  // Create a map of bin IDs to bin names and sizes
  const getBinIdToNameMap = async (binTypes: any[], missingBinReports: MissingBinReport[], missingBinIds: string[]) => {
    const binIdToNameMap = new Map();
    const binIdToSizeMap = new Map();
    
    // First populate map with data from binTypes array param
    binTypes.forEach(bin => {
      binIdToNameMap.set(bin.id, bin.name);
      binIdToSizeMap.set(bin.id, bin.bin_size || 'Unknown');
    });
    
    // For any missing bin IDs not in our map, fetch them all at once
    const uniqueBinIdsToFetch = new Set<string>();
    
    // Collect unique bin IDs that need fetching
    missingBinReports.forEach(report => {
      // Extract the full UUID if possible
      const binId = extractFullBinId(report.binId);
      if (!binIdToNameMap.has(binId)) {
        uniqueBinIdsToFetch.add(binId);
      }
    });
    
    missingBinIds.forEach(key => {
      // Extract the full UUID if possible
      const binId = extractFullBinId(key);
      if (!binIdToNameMap.has(binId)) {
        uniqueBinIdsToFetch.add(binId);
      }
    });
    
    // Fetch missing bin names in a single query if needed
    if (uniqueBinIdsToFetch.size > 0) {
      // Only fetch if we have valid UUIDs (36 characters)
      const validUUIDs = Array.from(uniqueBinIdsToFetch).filter(id => id.length === 36);
      
      if (validUUIDs.length > 0) {
        try {
          const { data: fetchedBinTypes } = await supabase
            .from('bin_types')
            .select('id, name, bin_size')
            .in('id', validUUIDs);
            
          if (fetchedBinTypes) {
            fetchedBinTypes.forEach((bin: any) => {
              binIdToNameMap.set(bin.id, bin.name);
              binIdToSizeMap.set(bin.id, bin.bin_size || 'Unknown');
            });
          }
        } catch (error) {
          console.error('Error fetching bin types:', error);
        }
      }
    }
    
    return { binIdToNameMap, binIdToSizeMap };
  };

  // Helper function to extract the full UUID from a string
  const extractFullBinId = (binIdString: string): string => {
    // Check if the binId is already in a format like "98bc0d1e-5b8d-42ce-a276-148fd6060d97"
    if (binIdString.length === 36 && binIdString.includes('-')) {
      return binIdString;
    }
    
    // If the binId is in a format like "98bc0d1e-5b8d-42ce-a276-148fd6060d97-General Waste"
    // Extract just the UUID part
    const uuidMatch = binIdString.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (uuidMatch) {
      return uuidMatch[1];
    }
    
    // For short formats, try to find a matching bin in the database later
    return binIdString;
  };

  // Process missing bin reports with bin names - fixed to accept 1 argument
  const processMissingBinReports = async (reports: MissingBinReport[]) => {
    const binIdsToFetch = reports.map(report => extractFullBinId(report.binId)).filter(id => id.length === 36);
    
    let binIdToNameMap = new Map<string, string>();
    let binIdToSizeMap = new Map<string, string>();
    
    // Fetch all bin types at once if needed
    if (binIdsToFetch.length > 0) {
      try {
        const { data: fetchedBinTypes } = await supabase
          .from('bin_types')
          .select('id, name, bin_size')
          .in('id', binIdsToFetch);
          
        if (fetchedBinTypes) {
          fetchedBinTypes.forEach((bin: any) => {
            binIdToNameMap.set(bin.id, bin.name);
            binIdToSizeMap.set(bin.id, bin.bin_size || 'Unknown');
          });
        }
      } catch (error) {
        console.error('Error fetching bin types:', error);
      }
    }
    
    // Make sure to return an array, not a Promise
    return reports.map(report => {
      // If binName is already set in the report, use it
      if (report.binName) {
        return report;
      }
      
      // Try to extract name from the binId format "id-name"
      if (report.binId.includes('-')) {
        // Try to match UUID-name format
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
        const match = report.binId.match(uuidPattern);
        
        if (match && match[1]) {
          const binId = extractFullBinId(report.binId);
          return {
            ...report,
            binName: match[1],
            binSize: binIdToSizeMap.get(binId) || 'Unknown'
          };
        }
        
        // Try simple id-name format
        const parts = report.binId.split('-');
        if (parts.length >= 2) {
          const binId = extractFullBinId(parts[0]);
          const namePart = parts.slice(1).join('-');
          if (namePart) {
            return {
              ...report,
              binName: namePart,
              binSize: binIdToSizeMap.get(binId) || 'Unknown'
            };
          }
        }
      }
      
      // Otherwise try to get name from the map using the ID part
      const binId = extractFullBinId(report.binId);
      const binName = binIdToNameMap.get(binId);
      const binSize = binIdToSizeMap.get(binId) || 'Unknown';
      
      if (binName) {
        return {
          ...report,
          binId,
          binName,
          binSize
        };
      }
      
      // If bin name still not found, make one more direct fetch attempt
      return {
        ...report,
        binName: 'Unknown',
        binSize: 'Unknown'
      };
    });
  };

  // Process missing bin IDs with their names - fixed to accept 1 argument
  const processMissingBinIds = async (missingBinIds: string[]) => {
    const binIdsToFetch = missingBinIds
      .map(key => extractFullBinId(key))
      .filter(id => id.length === 36);
      
    let binIdToNameMap = new Map<string, string>();
    let binIdToSizeMap = new Map<string, string>();
    
    // Fetch all bin types at once if needed
    if (binIdsToFetch.length > 0) {
      try {
        const { data: fetchedBinTypes } = await supabase
          .from('bin_types')
          .select('id, name, bin_size')
          .in('id', binIdsToFetch);
          
        if (fetchedBinTypes) {
          fetchedBinTypes.forEach((bin: any) => {
            binIdToNameMap.set(bin.id, bin.name);
            binIdToSizeMap.set(bin.id, bin.bin_size || 'Unknown');
          });
        }
      } catch (error) {
        console.error('Error fetching bin types:', error);
      }
    }
    
    // Return actual array data, not a Promise
    return missingBinIds.map(key => {
      // Try to extract name from the binId format "id-name"
      if (key.includes('-')) {
        // Try to match UUID-name format
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
        const match = key.match(uuidPattern);
        
        if (match && match[1]) {
          const binId = extractFullBinId(key);
          return {
            id: binId,
            name: match[1],
            size: binIdToSizeMap.get(binId) || 'Unknown'
          };
        }
        
        // Try simple id-name format
        const parts = key.split('-');
        const binId = extractFullBinId(parts[0]);
        // Join all parts after the first one to form the complete name
        const binName = parts.slice(1).join('-');
        
        if (binName) {
          return {
            id: binId,
            name: binName,
            size: binIdToSizeMap.get(binId) || 'Unknown'
          };
        }
      }
      
      // Otherwise try to get name from the map
      const binId = extractFullBinId(key);
      const binName = binIdToNameMap.get(binId);
      const binSize = binIdToSizeMap.get(binId) || 'Unknown';
      
      return {
        id: binId,
        name: binName || 'Unknown',
        size: binSize
      };
    });
  };

  return {
    getBinIdToNameMap,
    processMissingBinReports,
    processMissingBinIds,
    extractFullBinId
  };
};
