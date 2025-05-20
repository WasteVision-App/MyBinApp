
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
  const formatDateAU = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy h:mm a');
  };

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
                  <p className="font-medium">{selectedSubmission.submitted_by}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">User Type</p>
                  <p className="font-medium">{selectedSubmission.data?.userType || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-mybin-gray">Submission Time</p>
                  <p className="font-medium">{formatDateAU(selectedSubmission.submitted_at)}</p>
                </div>
              </div>
            </div>

            {selectedSubmission.data?.inspections?.length > 0 ? (
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
                  {selectedSubmission.data.inspections.map((inspection: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{inspection.binName}</TableCell>
                      <TableCell>
                        {inspection.fullness > 100 
                          ? 'Overflow' 
                          : `${inspection.fullness}%`}
                      </TableCell>
                      <TableCell>
                        {inspection.contaminated ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell>
                        {inspection.contaminationDetails || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-mybin-gray">No bin inspections recorded</p>
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
                        <TableCell>{report.binName || 'Unknown'}</TableCell>
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
                        <TableCell>{typeof missingBin === 'object' ? missingBin.name : missingBin}</TableCell>
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
