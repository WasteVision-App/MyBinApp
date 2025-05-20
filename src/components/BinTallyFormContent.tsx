
import React from 'react';
import UserInfoForm from '@/components/UserInfoForm';
import BinSelection from '@/components/BinSelection';
import BinInspectionForm from '@/components/BinInspectionForm';
import SubmissionSuccess from '@/components/SubmissionSuccess';
import SubmissionConfirmation from '@/components/SubmissionConfirmation';
import { Site, UserInfo, BinType, BinInspection, MissingBinReport } from '@/types';
import { Button } from '@/components/ui/button';

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
    // Find if the bin is already inspected
    const existingInspection = inspections.find(
      inspection => 
        inspection.binTypeId === selectedBin.id && 
        inspection.binName === selectedBin.name
    );
    
    // Find if the bin is reported as missing
    const binKey = `${selectedBin.id}-${selectedBin.name}`;
    const isMissing = missingBinIds.includes(binKey);
    const missingBinReport = isMissing ? findMissingBinReport(binKey) : undefined;
    
    return (
      <BinInspectionForm 
        bin={selectedBin}
        onSubmit={onInspectionSubmit}
        onCancel={onCancelInspection}
        onReportMissing={onReportMissingBin}
        initialData={existingInspection} // Pass existing inspection data if editing
        missingBinReport={missingBinReport} // Pass missing bin report if editing a missing bin
      />
    );
  }
  
  return (
    <>
      <BinSelection 
        bins={site?.bins || []}
        onSelectBin={onSelectBin}
        completedBinIds={inspections.map(i => `${i.binTypeId}-${i.binName}`)}
        missingBinIds={missingBinIds}
      />
      
      <div className="mt-4 text-center">
        <p className="text-sm text-mybin-gray mb-2">
          {inspections.length + missingBinIds.length} of {site ? site.bins.length : 0} bins accounted for
        </p>
        {allBinsAccountedFor() && (
          <Button
            onClick={() => onShowSubmissionConfirmation()}
            className="mybin-btn-primary w-full sm:w-auto"
          >
            Review & Submit
          </Button>
        )}
      </div>
    </>
  );
};

export default BinTallyFormContent;
