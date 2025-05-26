
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { extractBinName } from '@/utils/binUtils';

interface SubmissionDetailsDialogProps {
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  selectedSubmission: any | null;
}

const SubmissionDetailsDialog: React.FC<SubmissionDetailsDialogProps> = ({
  showDetails,
  setShowDetails,
  selectedSubmission
}) => {
  const [formBins, setFormBins] = useState<any[]>([]);
  const [formDetails, setFormDetails] = useState<any>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!selectedSubmission?.form_id) return;

      try {
        // Fetch form bins
        const { data: binsData, error: binsError } = await supabase
          .from('form_bins')
          .select(`
            id,
            quantity,
            bin_types (
              id,
              name,
              bin_size
            )
          `)
          .eq('form_id', selectedSubmission.form_id);

        if (binsError) throw binsError;
        console.log('Fetched form bins:', binsData);
        setFormBins(binsData || []);

        // Fetch form details including area
        const { data: formData, error: formError } = await supabase
          .from('bin_tally_forms')
          .select('area, location')
          .eq('id', selectedSubmission.form_id)
          .maybeSingle();

        if (formError) throw formError;
        console.log('Fetched form details:', formData);
        setFormDetails(formData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    if (showDetails && selectedSubmission) {
      fetchFormData();
    }
  }, [showDetails, selectedSubmission]);

  const formatDateAU = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy h:mm a');
  };

  const getAllBinsWithInspectionStatus = () => {
    if (!formBins.length) return [];

    const inspections = selectedSubmission?.data?.inspections || [];
    console.log('Inspections from submission:', inspections);
    const allBins: any[] = [];

    // Generate all bins based on form_bins with quantities
    formBins.forEach((formBin: any) => {
      const binType = formBin.bin_types;
      for (let i = 1; i <= formBin.quantity; i++) {
        const binName = formBin.quantity > 1 ? `${binType.name} #${i}` : binType.name;
        const binDisplayName = binType.bin_size ? `${binName} ${binType.bin_size}` : binName;
        
        // Find if this bin was inspected
        const inspection = inspections.find((insp: any) => 
          insp.binTypeId === binType.id && insp.binName === binName
        );

        console.log(`Checking bin ${binName}, inspection found:`, inspection);

        if (inspection) {
          // Bin was inspected
          allBins.push({
            binName: binDisplayName,
            fullness: inspection.fullness > 100 ? 'Overflow' : `${inspection.fullness}%`,
            contaminated: inspection.contaminated ? 'Yes' : 'No',
            details: inspection.contaminationDetails || '-',
            isInspected: true
          });
        } else {
          // Bin was not inspected - set details to "uninspected"
          allBins.push({
            binName: binDisplayName,
            fullness: '0%',
            contaminated: 'No',
            details: 'uninspected',
            isInspected: false
          });
        }
      }
    });

    console.log('All bins with inspection status:', allBins);
    return allBins;
  };

  const allBins = getAllBinsWithInspectionStatus();

  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Submission Details</DialogTitle>
          <DialogDescription>
            {selectedSubmission?.form_title} - Submitted by {selectedSubmission?.submitted_by} on {selectedSubmission ? formatDateAU(selectedSubmission.submitted_at) : ''}
          </DialogDescription>
        </DialogHeader>

        {selectedSubmission && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-mybin-gray">Form</p>
                  <p className="font-medium">{selectedSubmission.form_title}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Form Code</p>
                  <p className="font-medium">{selectedSubmission.unique_code}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Company</p>
                  <p className="font-medium">{selectedSubmission.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Submitted By</p>
                  <p className="font-medium">{selectedSubmission.submitted_by} - {selectedSubmission.data?.userType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Bin Area</p>
                  <p className="font-medium">{formDetails?.area || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Location</p>
                  <p className="font-medium">{formDetails?.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {allBins.length > 0 ? (
              <div>
                <h3 className="text-lg font-medium mb-2">Bin Inspection Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin Name</TableHead>
                      <TableHead>Fullness</TableHead>
                      <TableHead>Contaminated</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allBins.map((bin: any, index: number) => (
                      <TableRow key={index} className={!bin.isInspected ? 'bg-orange-50' : ''}>
                        <TableCell>{bin.binName}</TableCell>
                        <TableCell>{bin.fullness}</TableCell>
                        <TableCell>{bin.contaminated}</TableCell>
                        <TableCell className={!bin.isInspected ? 'text-orange-700 font-medium' : ''}>
                          {bin.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-mybin-gray">No bin inspection data available</p>
            )}
          
            {selectedSubmission.data?.missingBinReports?.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Missing Bin Reports</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin Name</TableHead>
                      <TableHead>Comment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubmission.data.missingBinReports.map((report: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{extractBinName(report.binName || report.binId)}</TableCell>
                        <TableCell>{report.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {selectedSubmission.data?.missingBinIds?.length > 0 && !selectedSubmission.data?.missingBinReports?.length && (
              <div>
                <h3 className="text-lg font-medium mb-2">Missing Bins</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bin Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSubmission.data.missingBinIds.map((missingBin: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{extractBinName(missingBin)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailsDialog;
