
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

interface SubmissionCardProps {
  submission: any;
  onViewDetails: (submission: any) => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onViewDetails }) => {
  const formatDateAU = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy h:mm a');
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;
    
    if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hour${Math.round(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return `${Math.round(diffInDays)} day${Math.round(diffInDays) !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card key={submission.id} className="overflow-hidden">
      <CardHeader className="pb-2 p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <CardTitle className="text-lg mb-1 sm:mb-0">{submission.form_title}</CardTitle>
          <span className="text-xs bg-mybin-light text-mybin-primary px-2 py-1 rounded-full inline-block w-fit">
            {submission.company_name}
          </span>
        </div>
        <CardDescription className="text-sm">
          Submitted by {submission.submitted_by} • {getTimeAgo(submission.submitted_at)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-mybin-gray">Form Code</p>
            <p className="font-medium truncate">{submission.unique_code}</p>
          </div>
          <div>
            <p className="text-mybin-gray">Submitted</p>
            <p className="font-medium">{formatDateAU(submission.submitted_at)}</p>
          </div>
          <div>
            <p className="text-mybin-gray">Bins Inspected</p>
            <p className="font-medium">{submission.data?.inspections?.length || 0}</p>
          </div>
          <div>
            <p className="text-mybin-gray">Bins Missing</p>
            <p className="font-medium">{submission.data?.missingBinIds?.length || 0}</p>
          </div>
        </div>
        
        {submission.data?.missingBinReports?.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="text-mybin-gray mb-1">Missing Bin Reasons:</p>
            <ul className="text-sm">
              {submission.data.missingBinReports.map((report: any, idx: number) => (
                <li key={idx} className="mb-1">
                  <span className="font-medium break-words">
                    {report.binName || 'Unknown'}:
                  </span> {report.comment}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          variant="link" 
          className="p-0 h-auto text-xs text-mybin-primary mt-2 flex items-center"
          onClick={() => onViewDetails(submission)}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default SubmissionCard;
