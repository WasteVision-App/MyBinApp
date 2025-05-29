
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';

interface MissingBinsTableProps {
  missingBins: any[];
}

const MissingBinsTable: React.FC<MissingBinsTableProps> = ({ missingBins }) => {
  if (missingBins.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Missing Bins</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bin Name</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missingBins.map((bin: any, index: number) => (
            <TableRow key={index} className="bg-red-50">
              <TableCell>{bin.binName}</TableCell>
              <TableCell>{bin.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MissingBinsTable;
