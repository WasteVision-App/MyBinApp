
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { BinInspection, Site } from '@/types';

interface InspectionsTableProps {
  inspections: BinInspection[];
  site: Site;
  onBack: () => void;
}

const InspectionsTable: React.FC<InspectionsTableProps> = ({ 
  inspections, 
  site, 
  onBack 
}) => {
  const getBinNameById = (binId: string) => {
    return site?.bins.find(bin => bin.id === binId)?.name || 'Unknown Bin';
  };

  const getFullnessLabel = (fullness: number) => {
    switch (fullness) {
      case 0: return "Empty (0%)";
      case 25: return "Quarter Full (25%)";
      case 50: return "Half Full (50%)";
      case 75: return "Nearly Full (75%)";
      case 100: return "Completely Full (100%)";
      case 125: return "Overflow";
      default: return `${fullness}%`;
    }
  };

  return (
    <div className="mybin-card overflow-x-auto">
      <h2 className="mybin-title mb-4">Submitted Inspections</h2>
      
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <Table>
          <TableCaption>
            List of your submitted bin inspections
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Bin Type</TableHead>
              <TableHead className="whitespace-nowrap">Fullness</TableHead>
              <TableHead className="whitespace-nowrap">Contaminated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.length > 0 ? (
              inspections.map((inspection) => (
                <TableRow key={inspection.binTypeId}>
                  <TableCell className="font-medium">{getBinNameById(inspection.binTypeId)}</TableCell>
                  <TableCell>{getFullnessLabel(inspection.fullness)}</TableCell>
                  <TableCell>{inspection.contaminated ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-mybin-gray">
                  No inspections submitted yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          onClick={onBack}
          className="mybin-btn-primary"
        >
          Back to Bin Selection
        </Button>
      </div>
    </div>
  );
};

export default InspectionsTable;
