
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';

interface InspectedBinsTableProps {
  inspectedBins: any[];
}

const InspectedBinsTable: React.FC<InspectedBinsTableProps> = ({ inspectedBins }) => {
  if (inspectedBins.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Inspected Bins</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bin Name</TableHead>
            <TableHead>Fullness</TableHead>
            <TableHead>Contaminated</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inspectedBins.map((bin: any, index: number) => (
            <TableRow key={index}>
              <TableCell>{bin.binName}</TableCell>
              <TableCell>{bin.fullness}</TableCell>
              <TableCell>{bin.contaminated}</TableCell>
              <TableCell>{bin.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InspectedBinsTable;
