
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
 * Create a unique bin key that includes ID, name, size, and UOM
 */
export const createBinKey = (bin: any): string => {
  if ('binTypeId' in bin) {
    // This is a BinInspection
    return `${bin.binTypeId}-${bin.binName}-${bin.binSize || ''}-${bin.binUom || ''}`;
  } else {
    // This is a BinType
    return `${bin.id}-${bin.name}-${bin.bin_size || ''}-${bin.bin_uom || ''}`;
  }
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
  
  // Return the processed bins with just the ID and name for lookup
  return missingIds.map(id => {
    const binId = extractBinId(id);
    return { id: binId, name: 'Unknown' };
  });
};
