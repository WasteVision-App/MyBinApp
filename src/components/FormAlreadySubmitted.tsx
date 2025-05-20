import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Note: This component is no longer used as multiple submissions are allowed,
// but we're keeping it in the codebase for future reference.
const FormAlreadySubmitted: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mybin-container p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Form Available for Submissions</h2>
        <p className="text-gray-700 mb-4">
          This form has been submitted before, but you can submit it again. Each submission will be recorded separately.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="mybin-btn-primary"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default FormAlreadySubmitted;
