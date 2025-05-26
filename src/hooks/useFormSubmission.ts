
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { UserInfo, BinInspection, MissingBinReport, Site } from '@/types';
import { useBinData } from './useBinData';
import { useSessionStorage } from './useSessionStorage';
import { useSubmitForm } from './useSubmitForm';

export const useFormSubmission = (
  site: Site | null,
  userInfo: UserInfo | null,
  inspections: BinInspection[],
  missingBinIds: string[],
  missingBinReports: MissingBinReport[],
  accessCode: string | undefined
) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');
  const navigate = useNavigate();
  
  // Use our hooks
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
    if (!site?.id || !userInfo) return;
    
    const timestamp = new Date().toISOString();
    
    // Get missing bin reports from session storage
    const savedMissingBinReports = sessionStorage.getItem('savedMissingBinReports');
    const missingBinReportsRaw: MissingBinReport[] = savedMissingBinReports 
      ? JSON.parse(savedMissingBinReports) 
      : [];
    
    // Create a set of inspected and missing bin keys for quick lookup
    const inspectedBinKeys = new Set(inspections.map(i => `${i.binTypeId}-${i.binName}`));
    const missingBinKeys = new Set(missingBinIds);
    
    // Find uninspected bins and create 0% full inspections for them
    const uninspectedBins = site.bins.filter(bin => {
      const binKey = `${bin.id}-${bin.name}`;
      return !inspectedBinKeys.has(binKey) && !missingBinKeys.has(binKey);
    });
    
    // Create 0% full inspections for uninspected bins
    const uninspectedInspections: BinInspection[] = uninspectedBins.map(bin => ({
      binTypeId: bin.id,
      binName: bin.name,
      binSize: bin.bin_size || 'Unknown',
      fullness: 0,
      contaminated: false,
      timestamp: timestamp
    }));
    
    // Combine all inspections
    const allInspections = [...inspections, ...uninspectedInspections];
    
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
      siteId: site.id,
      userId: userInfo.name,
      userType: userInfo.userType,
      inspections: allInspections,
      missingBinIds: formattedMissingBins,
      missingBinReports: formattedMissingBinReports,
      submittedAt: timestamp,
      accessCode,
      uninspectedBinsCount: uninspectedInspections.length
    });
    
    // Submit the form data with properly formatted bin information
    const { success } = await submitFormData(
      site.id,
      userInfo,
      allInspections,
      formattedMissingBins,
      missingBinReports,
      accessCode,
      timestamp
    );
    
    if (success) {
      setSubmissionTimestamp(timestamp);
      setIsSubmitted(true);
      clearFormData();
      
      // Show a message if there were uninspected bins
      if (uninspectedInspections.length > 0) {
        toast({
          title: "Submission Complete",
          description: `${uninspectedInspections.length} uninspected bin(s) were automatically reported as 0% full.`,
        });
      }
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
