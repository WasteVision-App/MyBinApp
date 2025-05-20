
import React from 'react';
import { Card } from '@/components/ui/card';
import SubmissionCard from './SubmissionCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubmissionsListProps {
  submissions: any[];
  onViewDetails: (submission: any) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ submissions, onViewDetails }) => {
  const isMobile = useIsMobile();
  
  if (submissions.length === 0) {
    return (
      <Card>
        <div className="pt-6 text-center text-mybin-gray p-4">
          No submissions found.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard 
          key={submission.id} 
          submission={submission} 
          onViewDetails={onViewDetails} 
        />
      ))}
    </div>
  );
};

export default SubmissionsList;
