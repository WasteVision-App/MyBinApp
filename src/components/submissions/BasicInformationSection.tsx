
import React from 'react';
import { format } from 'date-fns';

interface BasicInformationSectionProps {
  submission: any;
  formDetails: any;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  submission,
  formDetails
}) => {
  const formatDateAU = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy h:mm a');
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Basic Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-mybin-gray">Form</p>
          <p className="font-medium">{submission.form_title}</p>
        </div>
        <div>
          <p className="text-sm text-mybin-gray">Form Code</p>
          <p className="font-medium">{submission.unique_code}</p>
        </div>
        <div>
          <p className="text-sm text-mybin-gray">Company</p>
          <p className="font-medium">{submission.company_name}</p>
        </div>
        <div>
          <p className="text-sm text-mybin-gray">Submitted By</p>
          <p className="font-medium">{submission.submitted_by} - {submission.data?.userType || 'N/A'}</p>
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
  );
};

export default BasicInformationSection;
