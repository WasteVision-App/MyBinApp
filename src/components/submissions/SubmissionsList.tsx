
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SubmissionCard from './SubmissionCard';

interface SubmissionsListProps {
  submissions: any[];
  onViewDetails: (submission: any) => void;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({ submissions, onViewDetails }) => {
  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-mybin-gray">
          No submissions found.
        </CardContent>
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
