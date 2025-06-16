
import { useState, useEffect } from 'react';
import { BinInspection, BinType, Site, MissingBinReport } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { createBinKey } from '@/utils/binUtils';

export const useBinInspections = (site: Site | null) => {
  const [inspections, setInspections] = useState<BinInspection[]>([]);
  const [missingBinIds, setMissingBinIds] = useState<string[]>([]);
  const [missingBinReports, setMissingBinReports] = useState<MissingBinReport[]>([]);
  const [selectedBin, setSelectedBin] = useState<BinType | null>(null);
  const [showSubmissionConfirmation, setShowSubmissionConfirmation] = useState<boolean>(false);

  // Load saved data from sessionStorage when component mounts
  useEffect(() => {
    const savedInspections = sessionStorage.getItem('savedInspections');
    const savedMissingBinIds = sessionStorage.getItem('savedMissingBinIds');
    const savedMissingBinReports = sessionStorage.getItem('savedMissingBinReports');
    
    if (savedInspections) {
      setInspections(JSON.parse(savedInspections));
    }
    
    if (savedMissingBinIds) {
      setMissingBinIds(JSON.parse(savedMissingBinIds));
    }
    
    if (savedMissingBinReports) {
      setMissingBinReports(JSON.parse(savedMissingBinReports));
    }
  }, []);
  
  // Save data to sessionStorage whenever it changes
  useEffect(() => {
    if (inspections.length > 0) {
      sessionStorage.setItem('savedInspections', JSON.stringify(inspections));
    }
    
    if (missingBinIds.length > 0) {
      sessionStorage.setItem('savedMissingBinIds', JSON.stringify(missingBinIds));
    }
    
    if (missingBinReports.length > 0) {
      sessionStorage.setItem('savedMissingBinReports', JSON.stringify(missingBinReports));
    }
  }, [inspections, missingBinIds, missingBinReports]);

  const handleSelectBin = (bin: BinType) => {
    setSelectedBin(bin);
  };

  const allBinsAccountedFor = () => {
    if (!site) return false;
    
    return site.bins.every(bin => {
      const binKey = createBinKey(bin);
      return (
        inspections.some(i => createBinKey(i) === binKey) ||
        missingBinIds.includes(binKey)
      );
    });
  };

  // Helper to find a missing bin report by bin ID
  const findMissingBinReport = (binId: string): MissingBinReport | undefined => {
    return missingBinReports.find(report => report.binId === binId);
  };

  return {
    inspections,
    missingBinIds,
    missingBinReports,
    selectedBin,
    showSubmissionConfirmation,
    setSelectedBin,
    setShowSubmissionConfirmation,
    handleSelectBin,
    findMissingBinReport,
    handleInspectionSubmit: (inspection: BinInspection) => {
      const binKey = createBinKey(inspection);
      
      let updatedInspections;
      const existingIndex = inspections.findIndex(i => createBinKey(i) === binKey);
      
      if (existingIndex >= 0) {
        updatedInspections = [...inspections];
        updatedInspections[existingIndex] = inspection;
      } else {
        updatedInspections = [...inspections, inspection];
      }
      
      setInspections(updatedInspections);

      // If this bin was previously reported as missing, remove it from missing bins
      if (missingBinIds.includes(binKey)) {
        const newMissingBinIds = missingBinIds.filter(id => id !== binKey);
        setMissingBinIds(newMissingBinIds);
        sessionStorage.setItem('savedMissingBinIds', JSON.stringify(newMissingBinIds));
        
        // Also remove the missing bin report
        const updatedMissingBinReports = missingBinReports.filter(
          report => report.binId !== binKey
        );
        setMissingBinReports(updatedMissingBinReports);
        sessionStorage.setItem('savedMissingBinReports', JSON.stringify(updatedMissingBinReports));
      }
      
      setSelectedBin(null);
      
      toast({
        title: "Inspection Saved",
        description: "Bin inspection has been recorded successfully.",
      });
      
      const updatedAllBinsAccountedFor = site?.bins.every(bin => {
        const currentBinKey = createBinKey(bin);
        return (
          updatedInspections.some(i => createBinKey(i) === currentBinKey) ||
          missingBinIds.includes(currentBinKey)
        );
      });
      
      if (updatedAllBinsAccountedFor) {
        setShowSubmissionConfirmation(true);
      }
    },
    handleReportMissingBin: (reportedMissingBinIds: string[], comment: string) => {
      console.log('handleReportMissingBin called with:', reportedMissingBinIds);
      
      // The reportedMissingBinIds should already be the proper bin keys from BinInspectionForm
      // No need to convert them anymore, they should already include size and UOM
      const properBinKeys = reportedMissingBinIds;
      
      console.log('Using proper bin keys:', properBinKeys);
      
      // Remove any existing inspections for bins being reported as missing
      const updatedInspections = inspections.filter(inspection => {
        const inspectionKey = createBinKey(inspection);
        return !properBinKeys.includes(inspectionKey);
      });
      
      setInspections(updatedInspections);
      sessionStorage.setItem('savedInspections', JSON.stringify(updatedInspections));
      
      // Add the missing bin IDs to the list
      setMissingBinIds(prev => {
        const newMissingBinIds = [...prev, ...properBinKeys];
        sessionStorage.setItem('savedMissingBinIds', JSON.stringify(newMissingBinIds));
        return newMissingBinIds;
      });
      
      // Save the missing bin reports with comments using the proper bin keys
      setMissingBinReports(prev => {
        const newReports = properBinKeys.map(binKey => {
          // Find the bin details from the binKey
          const matchingBin = site?.bins.find(bin => {
            const siteBinKey = createBinKey(bin);
            return siteBinKey === binKey;
          });
          
          console.log('Creating missing bin report for key:', binKey, 'matched bin:', matchingBin);
          
          return {
            binId: binKey,
            comment: comment,
            binName: matchingBin?.name || 'Unknown',
            binSize: matchingBin?.bin_size || 'Unknown',
            timestamp: new Date().toISOString()
          };
        });
        
        const updatedReports = [...prev, ...newReports];
        sessionStorage.setItem('savedMissingBinReports', JSON.stringify(updatedReports));
        return updatedReports;
      });
      
      setSelectedBin(null);
      
      toast({
        title: "Missing Bin Reported",
        description: `${properBinKeys.length} bin(s) reported as missing.`,
      });
      
      setTimeout(() => {
        const allAccountedFor = allBinsAccountedFor();
        if (allAccountedFor) {
          setShowSubmissionConfirmation(true);
        }
      }, 0);
    },
    allBinsAccountedFor
  };
};
