
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubmissionSummaryCardsProps {
  submissions: any[];
}

const SubmissionSummaryCards: React.FC<SubmissionSummaryCardsProps> = ({ submissions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Total Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl sm:text-3xl font-bold text-mybin-primary">{submissions.length}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Total Bins Inspected</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl sm:text-3xl font-bold text-mybin-primary">
            {submissions.reduce((total, sub) => total + (sub.data?.inspections?.length || 0), 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Missing Bins Reported</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-2xl sm:text-3xl font-bold text-mybin-error">
            {submissions.reduce((total, sub) => total + (sub.data?.missingBinIds?.length || 0), 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionSummaryCards;
