
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';

interface UninspectedBinsTableProps {
  uninspectedBins: any[];
}

const UninspectedBinsTable: React.FC<UninspectedBinsTableProps> = ({ uninspectedBins }) => {
  if (uninspectedBins.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Uninspected Bins</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bin Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uninspectedBins.map((bin: any, index: number) => (
            <TableRow key={index} className="bg-yellow-50">
              <TableCell>{bin.binName}</TableCell>
              <TableCell className="text-yellow-700 font-medium">Uninspected</TableCell>
              <TableCell className="text-sm text-gray-600">{bin.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UninspectedBinsTable;
