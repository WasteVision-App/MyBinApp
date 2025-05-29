
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import BasicInformationSection from './BasicInformationSection';
import InspectedBinsTable from './InspectedBinsTable';
import UninspectedBinsTable from './UninspectedBinsTable';
import MissingBinsTable from './MissingBinsTable';

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
        // Fetch form bins with bin_uom included
        const { data: binsData, error: binsError } = await supabase
          .from('form_bins')
          .select(`
            id,
            quantity,
            bin_types (
              id,
              name,
              bin_size,
              bin_uom
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

  const getBinsByCategory = () => {
    const inspections = selectedSubmission?.data?.inspections || [];
    
    console.log('All inspections from submission:', inspections);
    
    const inspectedBins = inspections
      .filter((inspection: any) => !inspection.isUninspected && !inspection.isMissing)
      .map((inspection: any) => ({
        binName: inspection.binUom ? `${inspection.binName} (${inspection.binSize}${inspection.binUom})` : 
                 inspection.binSize ? `${inspection.binName} (${inspection.binSize})` : inspection.binName,
        fullness: inspection.fullness > 100 ? 'Overflow' : `${inspection.fullness}%`,
        contaminated: inspection.contaminated ? 'Yes' : 'No',
        details: inspection.contaminationDetails || '-'
      }));

    const uninspectedBins = inspections
      .filter((inspection: any) => inspection.isUninspected === true)
      .map((inspection: any) => ({
        binName: inspection.binUom ? `${inspection.binName} (${inspection.binSize}${inspection.binUom})` : 
                 inspection.binSize ? `${inspection.binName} (${inspection.binSize})` : inspection.binName,
        details: 'This bin was marked as uninspected during the submission'
      }));

    const missingBins = inspections
      .filter((inspection: any) => inspection.isMissing === true)
      .map((inspection: any) => ({
        binName: inspection.binUom ? `${inspection.binName} (${inspection.binSize}${inspection.binUom})` : 
                 inspection.binSize ? `${inspection.binName} (${inspection.binSize})` : inspection.binName,
        comment: inspection.missingComment || 'No comment provided'
      }));

    console.log('Categorized bins:', { inspectedBins, uninspectedBins, missingBins });
    return { inspectedBins, uninspectedBins, missingBins };
  };

  const { inspectedBins, uninspectedBins, missingBins } = getBinsByCategory();

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
            <BasicInformationSection 
              submission={selectedSubmission} 
              formDetails={formDetails} 
            />

            <InspectedBinsTable inspectedBins={inspectedBins} />

            <UninspectedBinsTable uninspectedBins={uninspectedBins} />

            <MissingBinsTable missingBins={missingBins} />

            {inspectedBins.length === 0 && uninspectedBins.length === 0 && missingBins.length === 0 && (
              <p className="text-sm text-mybin-gray">No bin inspection data available</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionDetailsDialog;
