
import React from 'react';
import UserInfoForm from '@/components/UserInfoForm';
import BinSelection from '@/components/BinSelection';
import BinInspectionForm from '@/components/BinInspectionForm';
import SubmissionSuccess from '@/components/SubmissionSuccess';
import SubmissionConfirmation from '@/components/SubmissionConfirmation';
import { Site, UserInfo, BinType, BinInspection, MissingBinReport } from '@/types';
import { Button } from '@/components/ui/button';
import { createBinKey } from '@/utils/binUtils';

interface BinTallyFormContentProps {
  site: Site;
  userInfo: UserInfo | null;
  isSubmitted: boolean;
  showSubmissionConfirmation: boolean;
  selectedBin: BinType | null;
  inspections: BinInspection[];
  missingBinIds: string[];
  missingBinReports: MissingBinReport[];
  allBinsAccountedFor: () => boolean;
  findMissingBinReport: (binId: string) => MissingBinReport | undefined;
  onUserInfoSubmit: (info: UserInfo) => void;
  onSelectBin: (bin: BinType) => void;
  onInspectionSubmit: (inspection: BinInspection) => void;
  onReportMissingBin: (binIds: string[], comment: string) => void;
  onShowSubmissionConfirmation: () => void;
  onConfirmSubmit: () => void;
  onCancelInspection: () => void;
  onFinish: () => void;
  submissionTimestamp?: string;
}

const BinTallyFormContent: React.FC<BinTallyFormContentProps> = ({
  site,
  userInfo,
  isSubmitted,
  showSubmissionConfirmation,
  selectedBin,
  inspections,
  missingBinIds,
  missingBinReports,
  allBinsAccountedFor,
  findMissingBinReport,
  onUserInfoSubmit,
  onSelectBin,
  onInspectionSubmit,
  onReportMissingBin,
  onShowSubmissionConfirmation,
  onConfirmSubmit,
  onCancelInspection,
  onFinish,
  submissionTimestamp
}) => {
  if (!userInfo) {
    return <UserInfoForm onSubmit={onUserInfoSubmit} />;
  }
  
  if (isSubmitted) {
    return (
      <SubmissionSuccess 
        timestamp={submissionTimestamp || new Date().toISOString()} 
        onFinish={onFinish} 
      />
    );
  }
  
  if (showSubmissionConfirmation) {
    return (
      <SubmissionConfirmation
        inspections={inspections}
        bins={site.bins}
        missingBinIds={missingBinIds}
        missingBinReports={missingBinReports}
        onConfirm={onConfirmSubmit}
        onEdit={() => onShowSubmissionConfirmation()}
      />
    );
  }
  
  if (selectedBin) {
    // Find if the bin is already inspected using the proper key
    const selectedBinKey = createBinKey(selectedBin);
    const existingInspection = inspections.find(
      inspection => createBinKey(inspection) === selectedBinKey
    );
    
    // Find if the bin is reported as missing
    const isMissing = missingBinIds.includes(selectedBinKey);
    const missingBinReport = isMissing ? findMissingBinReport(selectedBinKey) : undefined;
    
    return (
      <BinInspectionForm 
        bin={selectedBin}
        onSubmit={onInspectionSubmit}
        onCancel={onCancelInspection}
        onReportMissing={onReportMissingBin}
        initialData={existingInspection}
        missingBinReport={missingBinReport}
      />
    );
  }
  
  // Calculate how many bins have been inspected or reported as missing
  const accountedForBins = inspections.length + missingBinIds.length;
  const totalBins = site ? site.bins.length : 0;
  const hasInspectedBins = inspections.length > 0 || missingBinIds.length > 0;
  
  return (
    <>
      <BinSelection 
        bins={site?.bins || []}
        onSelectBin={onSelectBin}
        completedBinIds={inspections.map(i => createBinKey(i))}
        missingBinIds={missingBinIds}
      />
      
      <div className="mt-4 text-center">
        <p className="text-sm text-mybin-gray mb-2">
          {accountedForBins} of {totalBins} bins accounted for
        </p>
        
        {!allBinsAccountedFor() && accountedForBins < totalBins && (
          <p className="text-xs text-orange-600 mb-3">
            Uninspected bins will be reported as 0% full when you submit
          </p>
        )}
        
        {hasInspectedBins && (
          <Button
            onClick={() => onShowSubmissionConfirmation()}
            className="mybin-btn-primary w-full sm:w-auto"
          >
            {allBinsAccountedFor() ? 'Review & Submit' : 'Submit Inspection'}
          </Button>
        )}
        
        {!hasInspectedBins && (
          <p className="text-sm text-mybin-gray italic">
            Select at least one bin to inspect before submitting
          </p>
        )}
      </div>
    </>
  );
};

export default BinTallyFormContent;
