
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { UserInfo, BinInspection, MissingBinReport, Site } from '@/types';
import { useBinData } from './useBinData';
import { useSessionStorage } from './useSessionStorage';
import { useSubmitForm } from './useSubmitForm';
import { createBinKey } from '@/utils/binUtils';

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

  const handleSubmitAllInspections = async () => {
    if (!site?.id || !userInfo) return;
    
    const timestamp = new Date().toISOString();
    
    // Get missing bin reports from session storage
    const savedMissingBinReports = sessionStorage.getItem('savedMissingBinReports');
    const missingBinReportsRaw: MissingBinReport[] = savedMissingBinReports 
      ? JSON.parse(savedMissingBinReports) 
      : [];
    
    console.log("Raw missing bin reports from session:", missingBinReportsRaw);
    
    // Create a map to track the final state of each bin (using bin keys for uniqueness)
    const finalBinStates = new Map<string, BinInspection>();
    
    // First, add all regular inspections
    inspections.forEach(inspection => {
      const bin = site.bins.find(b => b.id === inspection.binTypeId && b.name === inspection.binName);
      const binKey = createBinKey(bin || inspection);
      
      finalBinStates.set(binKey, {
        ...inspection,
        binUom: bin?.bin_uom || '',
        isUninspected: false,
        isMissing: false
      });
    });
    
    // Then, process missing bins (these will override any existing inspections)
    missingBinReportsRaw.forEach(report => {
      console.log("Processing missing bin report:", report);
      
      // Find the corresponding bin in site.bins by checking if binId matches the bin key
      const matchingBin = site.bins.find(bin => {
        const expectedBinKey = createBinKey(bin);
        return report.binId === expectedBinKey;
      });
      
      if (matchingBin) {
        const binKey = createBinKey(matchingBin);
        console.log("Found matching bin for missing report:", matchingBin);
        
        // Override any existing inspection for this bin
        finalBinStates.set(binKey, {
          binTypeId: matchingBin.id,
          binName: matchingBin.name,
          binSize: matchingBin.bin_size || 'Unknown',
          binUom: matchingBin.bin_uom || '',
          fullness: undefined,
          contaminated: undefined,
          isUninspected: false,
          isMissing: true,
          missingComment: report.comment,
          timestamp: timestamp
        });
      } else {
        console.error("Could not find matching bin for missing report:", report.binId);
      }
    });
    
    // Find uninspected bins (not in finalBinStates)
    const accountedBinKeys = new Set(finalBinStates.keys());
    const uninspectedBins = site.bins.filter(bin => {
      const binKey = createBinKey(bin);
      return !accountedBinKeys.has(binKey);
    });
    
    // Add uninspected bins
    uninspectedBins.forEach(bin => {
      const binKey = createBinKey(bin);
      finalBinStates.set(binKey, {
        binTypeId: bin.id,
        binName: bin.name,
        binSize: bin.bin_size || 'Unknown',
        binUom: bin.bin_uom || '',
        fullness: undefined,
        contaminated: undefined,
        isUninspected: true,
        isMissing: false,
        timestamp: timestamp
      });
    });
    
    // Convert map to array for submission
    const allInspections = Array.from(finalBinStates.values());
    
    console.info("Final deduplicated submission:", {
      siteId: site.id,
      userId: userInfo.name,
      userType: userInfo.userType,
      inspections: allInspections,
      submittedAt: timestamp,
      accessCode,
      uninspectedBinsCount: uninspectedBins.length,
      missingBinsCount: missingBinReportsRaw.length
    });
    
    // Submit the form data with deduplicated structure
    const { success } = await submitFormData(
      site.id,
      userInfo,
      allInspections,
      [], // No longer using separate arrays
      [], // No longer using separate arrays
      accessCode,
      timestamp
    );
    
    if (success) {
      setSubmissionTimestamp(timestamp);
      setIsSubmitted(true);
      clearFormData();
      
      // Show summary message
      const uninspectedCount = uninspectedBins.length;
      const missingCount = missingBinReportsRaw.length;
      let message = "Submission complete.";
      if (uninspectedCount > 0 || missingCount > 0) {
        const parts = [];
        if (uninspectedCount > 0) parts.push(`${uninspectedCount} uninspected bin(s)`);
        if (missingCount > 0) parts.push(`${missingCount} missing bin(s)`);
        message = `Submission complete. ${parts.join(' and ')} were automatically recorded.`;
      }
      
      toast({
        title: "Submission Complete",
        description: message,
      });
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
