
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BinInspection, BinType, MissingBinReport } from '@/types';
import { createBinKey } from '@/utils/binUtils';

interface SubmissionConfirmationProps {
  inspections: BinInspection[];
  bins: BinType[];
  missingBinIds: string[];
  missingBinReports: MissingBinReport[];
  onConfirm: () => void;
  onEdit: () => void;
}

const SubmissionConfirmation: React.FC<SubmissionConfirmationProps> = ({
  inspections,
  bins,
  missingBinIds,
  missingBinReports,
  onConfirm,
  onEdit
}) => {
  const getFullnessLabel = (fullness: number) => {
    switch (fullness) {
      case 0: return "Empty (0%)";
      case 25: return "Quarter Full (25%)";
      case 50: return "Half Full (50%)";
      case 75: return "Nearly Full (75%)";
      case 100: return "Completely Full (100%)";
      case 125: return "Overflow";
      default: return `${fullness}%`;
    }
  };

  // Format bin name with size and UOM
  const formatBinDisplayName = (bin: BinType) => {
    if (bin.bin_size && bin.bin_uom) {
      return `${bin.name} (${bin.bin_size}${bin.bin_uom})`;
    } else if (bin.bin_size) {
      return `${bin.name} (${bin.bin_size})`;
    }
    return bin.name;
  };

  // Calculate uninspected bins using proper bin key matching
  const getUninspectedBins = () => {
    const inspectedBinKeys = new Set(inspections.map(i => createBinKey(i)));
    const missingBinKeysSet = new Set(missingBinIds);
    
    return bins.filter(bin => {
      const binKey = createBinKey(bin);
      const isInspected = inspectedBinKeys.has(binKey);
      const isMissing = missingBinKeysSet.has(binKey);
      
      console.log(`Checking bin ${binKey}: inspected=${isInspected}, missing=${isMissing}`);
      
      return !isInspected && !isMissing;
    });
  };

  // Get missing bins with proper matching to avoid duplicates
  const getMissingBinsDisplay = () => {
    const missingBinsDisplay: { key: string; bin: BinType; report?: MissingBinReport }[] = [];
    
    // Create a map of missing bin IDs to their reports
    const reportMap = new Map<string, MissingBinReport>();
    missingBinReports.forEach(report => {
      reportMap.set(report.binId, report);
    });
    
    // For each missing bin ID, find the corresponding bin and create display entry
    missingBinIds.forEach(missingBinId => {
      const matchingBin = bins.find(bin => {
        const binKey = createBinKey(bin);
        return binKey === missingBinId;
      });
      
      if (matchingBin) {
        const binKey = createBinKey(matchingBin);
        const report = reportMap.get(missingBinId);
        
        // Only add if we haven't already added this exact bin
        if (!missingBinsDisplay.some(item => item.key === binKey)) {
          missingBinsDisplay.push({
            key: binKey,
            bin: matchingBin,
            report: report
          });
        }
      }
    });
    
    return missingBinsDisplay;
  };

  const uninspectedBins = getUninspectedBins();
  const missingBinsDisplay = getMissingBinsDisplay();

  // Format date in Australian format (DD/MM/YYYY h:mm AM/PM)
  const formatDateAU = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(now);
  };

  return (
    <div className="mybin-card">
      <h2 className="mybin-title mb-4">Confirm Submission</h2>
      
      <p className="text-mybin-gray mb-2">
        Current time: {formatDateAU()}
      </p>
      
      <p className="text-mybin-gray mb-6">
        Please review your inspection data before final submission:
      </p>
      
      {/* Inspected Bins Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-mybin-light text-mybin-dark">
            <tr>
              <th className="text-left p-3">Bin</th>
              <th className="text-left p-3">Fullness</th>
              <th className="text-left p-3">Contaminated</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection, index) => {
              // Find the matching bin to get proper display formatting
              const matchingBin = bins.find(bin => {
                const binKey = createBinKey(bin);
                const inspectionKey = createBinKey(inspection);
                return binKey === inspectionKey;
              });
              
              const binDisplayName = matchingBin ? formatBinDisplayName(matchingBin) : inspection.binName;
              
              return (
                <tr key={`inspection-${createBinKey(inspection)}-${index}`} className="border-b border-gray-200">
                  <td className="p-3">{binDisplayName}</td>
                  <td className="p-3">{getFullnessLabel(inspection.fullness)}</td>
                  <td className="p-3">
                    {inspection.contaminated ? (
                      <div>
                        <span className="text-mybin-error">Yes</span>
                        {inspection.contaminationDetails && (
                          <div className="text-xs text-mybin-gray mt-1">
                            {inspection.contaminationDetails}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-mybin-success">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Uninspected Bins Table */}
      {uninspectedBins.length > 0 && (
        <div className="mb-6">
          <h3 className="text-mybin-secondary font-medium mb-2">Uninspected Bins</h3>
          <div className="bg-orange-50 rounded-lg border border-orange-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-orange-100 text-orange-800">
                <tr>
                  <th className="text-left p-3">Bin</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {uninspectedBins.map((bin, index) => {
                  const binDisplayName = formatBinDisplayName(bin);
                  
                  return (
                    <tr key={`uninspected-${createBinKey(bin)}-${index}`} className="border-b border-orange-200 last:border-b-0">
                      <td className="p-3">{binDisplayName}</td>
                      <td className="p-3 text-orange-700">Reported as Empty (0%)</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Missing Bins Section */}
      {missingBinsDisplay.length > 0 && (
        <div className="mb-6">
          <h3 className="text-mybin-secondary font-medium mb-2">Missing Bins Reported</h3>
          <div className="bg-mybin-light bg-opacity-30 p-3 rounded-md">
            <ul className="list-disc pl-5 text-sm">
              {missingBinsDisplay.map(({ key, bin, report }) => {
                const displayName = formatBinDisplayName(bin);
                
                return (
                  <li key={`missing-${key}`} className="mb-2">
                    <div className="font-medium">{displayName}</div>
                    {report?.comment && (
                      <div className="text-xs text-mybin-gray mt-1">
                        Reason: {report.comment}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onEdit}
          className="mybin-btn-secondary flex-1"
        >
          Edit
        </Button>
        <Button 
          type="button" 
          onClick={onConfirm}
          className="mybin-btn-primary flex-1"
        >
          Confirm Submission
        </Button>
      </div>
    </div>
  );
};

export default SubmissionConfirmation;
