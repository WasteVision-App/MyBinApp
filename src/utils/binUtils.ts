
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to extract just the bin name from various formats
 */
export const extractBinName = (binData: any): string => {
  if (typeof binData === 'object' && binData.name) {
    return binData.name;
  }
  
  if (typeof binData === 'string') {
    // Handle format like "2477 (4c5d-9144-7d0293b5cc15-Organic #1)"
    // Extract the part after the last dash within parentheses
    const parenMatch = binData.match(/\(.*-([^)]+)\)$/);
    if (parenMatch) {
      return parenMatch[1];
    }
    
    // Handle format like "uuid-Organic #1" 
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i;
    const uuidMatch = binData.match(uuidPattern);
    if (uuidMatch) {
      return uuidMatch[1];
    }
    
    // Handle simple format like "id-name"
    if (binData.includes('-')) {
      const parts = binData.split('-');
      // Return everything after the first part (which is likely an ID)
      return parts.slice(1).join('-');
    }
    
    return binData;
  }
  
  return 'Unknown';
};

/**
 * Process missing bins to display correctly with bin size
 * @param missingIds Array of bin IDs to process
 * @returns Processed bins with proper name formatting
 */
export const processMissingBins = async (missingIds: string[]) => {
  // Extract UUIDs from bin IDs
  const extractBinId = (id: string) => {
    const match = id.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    return match ? match[1] : id;
  };
  
  // Extract name from bin IDs that have format "uuid-name-size" or "uuid-name"
  const extractBinInfo = (id: string) => {
    // Extract everything after the UUID
    const match = id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(.+)$/i);
    if (match && match[1]) {
      const nameWithSize = match[1];
      // We'll let the database lookup add the size
      return nameWithSize;
    }
    
    // If it has any dashes, take everything after the first dash
    if (id.includes('-')) {
      const parts = id.split('-');
      if (parts.length > 1) {
        return parts.slice(1).join('-');
      }
    }
    
    return null;
  };
  
  // First, extract bin IDs and any embedded names/sizes
  const processedBins = missingIds.map(id => {
    const binId = extractBinId(id);
    const binInfo = extractBinInfo(id);
    return { id: binId, name: binInfo, originalId: id };
  });
  
  // For bins without embedded names, fetch from database
  const binsToFetch = processedBins
    .filter(bin => bin.name === null)
    .map(bin => bin.id);
    
  if (binsToFetch.length > 0) {
    try {
      const { data } = await supabase
        .from('bin_types')
        .select('id, name, bin_size')
        .in('id', binsToFetch);
        
      if (data) {
        const fetchedBinMap = new Map();
        data.forEach(bin => {
          // Always format as "Name Size" if size is available
          const displayName = bin.bin_size 
            ? `${bin.name} ${bin.bin_size}`
            : bin.name;
          fetchedBinMap.set(bin.id, displayName);
        });
        
        // Update bins with fetched names
        processedBins.forEach(bin => {
          if (bin.name === null) {
            bin.name = fetchedBinMap.get(bin.id) || 'Unknown';
          }
        });
      }
    } catch (error) {
      console.error("Error fetching bin names:", error);
    }
  }
  
  // Additional database lookup for ALL bin IDs to get sizes for bins that don't already have size info
  const allBinIds = processedBins
    .filter(bin => bin.id.length === 36) // Only fetch valid UUIDs
    .map(bin => bin.id);
    
  if (allBinIds.length > 0) {
    try {
      const { data } = await supabase
        .from('bin_types')
        .select('id, name, bin_size')
        .in('id', allBinIds);
        
      if (data) {
        // Create a map of bin ID to bin size
        const binSizeMap = new Map();
        data.forEach(bin => {
          if (bin.bin_size) {
            binSizeMap.set(bin.id, bin.bin_size);
          }
        });
        
        // Update processed bins with size information only if they don't already have it
        processedBins.forEach(bin => {
          const binSize = binSizeMap.get(bin.id);
          if (binSize && bin.name) {
            // Check if the name already contains size information (like "140L" or "140")
            const hasSize = bin.name.match(/\b\d+[A-Za-z]*\b/);
            if (!hasSize) {
              // Only add size if it's not already present
              bin.name = `${bin.name} ${binSize}`;
            }
          }
        });
      }
    } catch (error) {
      console.error("Error fetching bin sizes:", error);
    }
  }
  
  return processedBins;
};
