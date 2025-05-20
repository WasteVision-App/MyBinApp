
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { UserInfo, BinInspection, MissingBinReport } from '@/types';
import { useBinData } from './useBinData';
import { useSessionStorage } from './useSessionStorage';
import { useSubmitForm } from './useSubmitForm';

export const useFormSubmission = (
  siteId: string | undefined,
  userInfo: UserInfo | null,
  inspections: BinInspection[],
  missingBinIds: string[],
  missingBinReports: MissingBinReport[],
  accessCode: string | undefined
) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');
  const navigate = useNavigate();
  
  // Use our new hooks
  const { getBinIdToNameMap, processMissingBinReports } = useBinData();
  const { clearFormData, clearAllData } = useSessionStorage();
  const { submitFormData } = useSubmitForm();

  // Get proper bin name and size from binTypes array
  const getBinNameAndSize = (binId: string): { name: string, size: string } => {
    // Extract the UUID part if it's in a format like "uuid-name"
    const uuidMatch = binId.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    const uuid = uuidMatch ? uuidMatch[1] : binId;
    
    // Try to extract name from the format "uuid-name"
    if (binId.includes('-')) {
      const parts = binId.split('-');
      if (parts.length > 1) {
        const nameParts = parts.slice(1); // Skip the first part (assumed to be ID)
        return { name: nameParts.join('-'), size: '' };
      }
    }
    
    return { name: 'Unknown', size: '' };
  };

  const handleSubmitAllInspections = async () => {
    if (!siteId || !userInfo) return;
    
    const timestamp = new Date().toISOString();
    
    // Get missing bin reports from session storage
    const savedMissingBinReports = sessionStorage.getItem('savedMissingBinReports');
    const missingBinReportsRaw: MissingBinReport[] = savedMissingBinReports 
      ? JSON.parse(savedMissingBinReports) 
      : [];
    
    // Format missing bin reports with proper names before submission
    const formattedMissingBinReports = missingBinReportsRaw.map(report => {
      const { name, size } = getBinNameAndSize(report.binId);
      const formattedName = size ? `${name} ${size}` : name;
      
      return {
        ...report,
        binName: formattedName,
        binId: report.binId // Keep the original binId for reference
      };
    });
    
    // Format missing bin IDs
    const formattedMissingBins = missingBinIds.map(id => {
      const { name, size } = getBinNameAndSize(id);
      const formattedName = size ? `${name} ${size}` : name;
      
      return {
        id: id, // Keep original ID for reference
        name: formattedName
      };
    });
    
    console.info("Submission:", {
      siteId,
      userId: userInfo.name,
      userType: userInfo.userType,
      inspections,
      missingBinIds: formattedMissingBins,
      missingBinReports: formattedMissingBinReports,
      submittedAt: timestamp,
      accessCode
    });
    
    // Submit the form data with properly formatted bin information
    const { success } = await submitFormData(
      siteId,
      userInfo,
      inspections,
      formattedMissingBins,
      missingBinReports,
      accessCode,
      timestamp
    );
    
    if (success) {
      setSubmissionTimestamp(timestamp);
      setIsSubmitted(true);
      clearFormData();
    }
  };

  const handleFinish = () => {
    clearAllData();
    navigate('/');
    toast({
      title: "Thank You",
      description: "Your submission has been recorded. You have been logged out.",
    });
  };

  return {
    isSubmitted,
    submissionTimestamp,
    handleSubmitAllInspections,
    handleFinish
  };
};
