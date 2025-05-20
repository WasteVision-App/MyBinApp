
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useSubmissions } from '@/hooks/useSubmissions';

import SubmissionSearchBar from '@/components/submissions/SubmissionSearchBar';
import SubmissionsList from '@/components/submissions/SubmissionsList';
import SubmissionSummaryCards from '@/components/submissions/SubmissionSummaryCards';
import SubmissionDetailsDialog from '@/components/submissions/SubmissionDetailsDialog';

const SubmissionReportsPage: React.FC = () => {
  const { filteredSubmissions, loading, searchQuery, setSearchQuery } = useSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = (submission: any) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mybin-dark">
            {loading ? 'Loading submissions...' : 'Form Submissions'}
          </h1>
          <p className="text-mybin-gray">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
            ) : (
              `${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>
      </div>

      <SubmissionSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <SubmissionsList 
            submissions={filteredSubmissions} 
            onViewDetails={handleViewDetails} 
          />
        </TabsContent>
        
        <TabsContent value="summary" className="mt-4">
          <SubmissionSummaryCards submissions={filteredSubmissions} />
        </TabsContent>
      </Tabs>

      <SubmissionDetailsDialog
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        selectedSubmission={selectedSubmission}
      />
    </div>
  );
};

export default SubmissionReportsPage;
