
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BinInspection, BinType, MissingBinReport } from '@/types';
import { processMissingBins } from '@/utils/binUtils';

interface SubmissionConfirmationProps {
  inspections: BinInspection[];
  bins: BinType[];
  missingBinIds: string[];
  missingBinReports: MissingBinReport[]; // Include missingBinReports
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
  const [missingBins, setMissingBins] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    const loadMissingBins = async () => {
      console.log("Processing missing bins:", missingBinIds);
      const processedMissingBins = await processMissingBins(missingBinIds);
      console.log("Processed missing bins:", processedMissingBins);
      setMissingBins(processedMissingBins);
    };
    
    if (missingBinIds.length > 0) {
      loadMissingBins();
    }
  }, [missingBinIds]);
  
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

  const getBinNameById = (binId: string) => {
    const bin = bins.find(bin => bin.id === binId);
    if (bin) {
      return bin.bin_size ? `${bin.name} ${bin.bin_size}` : bin.name;
    }
    return 'Unknown Bin';
  };

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
              // Always use our getBinNameById function for consistency
              // This will ensure the bin size is always included
              const binDisplayName = getBinNameById(inspection.binTypeId);
              
              return (
                <tr key={`${inspection.binTypeId}-${inspection.binName}-${index}`} className="border-b border-gray-200">
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
      
      {missingBins.length > 0 && (
        <div className="mb-6">
          <h3 className="text-mybin-secondary font-medium mb-2">Missing Bins Reported</h3>
          <div className="bg-mybin-light bg-opacity-30 p-3 rounded-md">
            <ul className="list-disc pl-5 text-sm">
              {missingBins.map(bin => {
                // Try to find a matching missing bin report to display its comment
                const binId = `${bin.id}-${bin.name}`;
                const report = missingBinReports.find(r => r.binId === binId);
                
                return (
                  <li key={`missing-${bin.id}`} className="mb-2">
                    <div className="font-medium">{bin.name}</div>
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
