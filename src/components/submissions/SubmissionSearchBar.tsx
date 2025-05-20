
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SubmissionSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SubmissionSearchBar: React.FC<SubmissionSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="relative mb-4">
      <Input
        type="text"
        placeholder="Search submissions by form, company, submitter or form code..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
    </div>
  );
};

export default SubmissionSearchBar;
