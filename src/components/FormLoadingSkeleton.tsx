
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const FormLoadingSkeleton: React.FC = () => {
  return (
    <div className="mybin-container">
      <div className="p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default FormLoadingSkeleton;
