
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pen, Trash } from "lucide-react";
import { BinType } from "@/types/binTypes";

interface BinTypesTableProps {
  binTypes: BinType[];
  loading: boolean;
  onEdit: (binType: BinType) => void;
  onDelete: (id: string) => void;
}

export const BinTypesTable: React.FC<BinTypesTableProps> = ({
  binTypes,
  loading,
  onEdit,
  onDelete,
}) => {
  const getDisplaySize = (binType: BinType) => {
    if (binType.bin_size && binType.bin_uom) {
      return `${binType.bin_size}${binType.bin_uom}`;
    }
    return binType.bin_size || "-";
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this bin type?")) return;
    onDelete(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bin Types</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {binTypes.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell>{bin.name}</TableCell>
                  <TableCell>{getDisplaySize(bin)}</TableCell>
                  <TableCell>{bin.color || "-"}</TableCell>
                  <TableCell>{bin.icon || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(bin)} className="mr-1">
                      <Pen className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(bin.id)} className="text-red-500 hover:text-red-700">
                      <Trash className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
