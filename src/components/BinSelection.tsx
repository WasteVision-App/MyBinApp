
import React from 'react';
import { BinType } from '@/types';
import * as LucideIcons from 'lucide-react';
import { PackageX, Edit } from 'lucide-react';

interface BinSelectionProps {
  bins: BinType[];
  onSelectBin: (binType: BinType) => void;
  completedBinIds?: string[];
  missingBinIds?: string[];
}

const BinSelection: React.FC<BinSelectionProps> = ({ 
  bins, 
  onSelectBin,
  completedBinIds = [],
  missingBinIds = []
}) => {
  // Function to render the appropriate icon based on the icon name
  const renderBinIcon = (iconName: string) => {
    // Convert to a standardized format (remove spaces, to lowercase)
    const normalizedIconName = iconName.replace(/\s+/g, '-').toLowerCase();
    
    // Use the name to get the component from Lucide
    const IconComponent = (LucideIcons as any)[normalizedIconName] || 
                         (LucideIcons as any)[normalizedIconName.charAt(0).toUpperCase() + normalizedIconName.slice(1)] ||
                         (LucideIcons as any)["Trash2"];
    
    return <IconComponent size={24} className="shrink-0" />;
  };

  // Format bin display name to include size and UOM if available
  const formatBinDisplayName = (bin: BinType): string => {
    console.log('Formatting bin display name for:', bin.name, 'Size:', bin.bin_size, 'UOM:', bin.bin_uom);
    
    if (bin.bin_size && bin.bin_uom) {
      return `${bin.name} (${bin.bin_size}${bin.bin_uom})`;
    } else if (bin.bin_size) {
      return `${bin.name} (${bin.bin_size})`;
    }
    return bin.name;
  };

  // Debug: Log all bins data
  console.log('BinSelection received bins:', bins);

  return (
    <div className="mybin-card">
      <h2 className="mybin-title">Select Bin Type</h2>
      <p className="text-mybin-gray mb-4 text-sm sm:text-base">
        Choose a bin type to inspect. A checkmark indicates you've already inspected this bin type.
      </p>
      
      <div className="grid grid-cols-1 gap-2 mb-6">
        {bins.map((bin) => {
          // Create a unique identifier for this bin
          const binKey = `${bin.id}-${bin.name}`;
          const isCompleted = completedBinIds.includes(binKey);
          const isMissing = missingBinIds.includes(binKey);
          
          return (
            <button
              key={binKey}
              className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                isCompleted
                  ? isMissing 
                    ? 'border-red-500 bg-red-50'
                    : 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-mybin-primary'
              }`}
              onClick={() => onSelectBin(bin)}
            >
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full mr-2 sm:mr-3 text-white flex-shrink-0 ${
                  isMissing ? 'bg-red-500' : ''
                }`}
                style={{ backgroundColor: isMissing ? undefined : bin.color }}
              >
                {isMissing ? <PackageX size={20} className="sm:size-24" /> : renderBinIcon(bin.icon)}
              </div>
              <div className="flex flex-col flex-grow text-left overflow-hidden">
                <span className="font-medium text-sm sm:text-base whitespace-nowrap overflow-hidden text-ellipsis">{formatBinDisplayName(bin)}</span>
                {isMissing && (
                  <span className="text-xs sm:text-sm text-red-500">Reported Missing</span>
                )}
                {isCompleted && !isMissing && (
                  <span className="text-xs sm:text-sm text-green-500">Completed (click to edit)</span>
                )}
              </div>
              {isCompleted && (
                <div className="ml-2 flex-shrink-0">
                  {isMissing ? (
                    <span className="text-red-500">✓</span>
                  ) : (
                    <Edit className="h-4 w-4 text-green-600" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BinSelection;
