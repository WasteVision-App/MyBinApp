
import { useState, useEffect } from 'react';
import { BinInspection, BinType, Site, MissingBinReport } from '@/types';
import { toast } from '@/components/ui/use-toast';

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
      const binKey = `${bin.id}-${bin.name}`;
      return (
        inspections.some(i => `${i.binTypeId}-${i.binName}` === binKey) ||
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
    findMissingBinReport, // Add this method to expose finding missing bin reports
    handleInspectionSubmit: (inspection: BinInspection) => {
      const binKey = `${inspection.binTypeId}-${inspection.binName}`;
      
      let updatedInspections;
      if (inspections.findIndex(i => 
        i.binTypeId === inspection.binTypeId && i.binName === inspection.binName
      ) >= 0) {
        updatedInspections = [...inspections];
        updatedInspections[inspections.findIndex(i => 
          i.binTypeId === inspection.binTypeId && i.binName === inspection.binName
        )] = inspection;
      } else {
        updatedInspections = [...inspections];
        updatedInspections.push(inspection);
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
        const currentBinKey = `${bin.id}-${bin.name}`;
        return (
          updatedInspections.some(i => `${i.binTypeId}-${i.binName}` === currentBinKey) ||
          missingBinIds.includes(currentBinKey)
        );
      });
      
      if (updatedAllBinsAccountedFor) {
        setShowSubmissionConfirmation(true);
      }
    },
    handleReportMissingBin: (reportedMissingBinIds: string[], comment: string) => {
      // Add the missing bin IDs to the list
      setMissingBinIds(prev => {
        const updatedMissingBinIds = [...prev, ...reportedMissingBinIds];
        sessionStorage.setItem('savedMissingBinIds', JSON.stringify(updatedMissingBinIds));
        return updatedMissingBinIds;
      });
      
      // Save the missing bin reports with comments
      setMissingBinReports(prev => {
        const newReports = reportedMissingBinIds.map(id => {
          // Extract bin name and size from the composite ID if it's in the format "id-name-size"
          let binName = 'Unknown';
          if (id.includes('-')) {
            const parts = id.split('-');
            // Check if there are at least 2 parts (id and name)
            if (parts.length >= 2) {
              const name = parts[1];
              // If there's also a size part
              if (parts.length >= 3) {
                const size = parts.slice(2).join('-');
                binName = `${name} (${size})`;
              } else {
                binName = name;
              }
            }
          }
          
          return {
            binId: id,
            comment: comment,
            binName: binName,
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
        description: `${reportedMissingBinIds.length} bin(s) reported as missing.`,
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

