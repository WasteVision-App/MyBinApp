
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SubmissionSuccessProps {
  timestamp: string;
  onFinish: () => void;
}

const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ timestamp, onFinish }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Format date in Australian format (day/month/year)
      return new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (e) {
      // Fallback if there's an error parsing the date
      return dateString;
    }
  };

  return (
    <div className="mybin-card text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-mybin-success h-16 w-16" />
      </div>
      
      <h2 className="mybin-title">Inspection Complete!</h2>
      
      <p className="text-mybin-gray mb-4">
        Your bin inspection has been successfully recorded.
      </p>
      
      <div className="bg-mybin-light bg-opacity-20 p-3 rounded-md mb-6">
        <p className="text-sm text-mybin-secondary">
          Submitted: {formatDate(timestamp)}
        </p>
      </div>
      
      <Button onClick={onFinish} className="mybin-btn-primary w-full">
        Finish
      </Button>
    </div>
  );
};

export default SubmissionSuccess;
