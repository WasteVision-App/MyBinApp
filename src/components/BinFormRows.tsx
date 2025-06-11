
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, Plus } from "lucide-react";
import { BinType } from "@/types";

interface BinRow {
  id?: string;
  bin_type_id: string;
  bin_size: string;
  bin_uom: string;
  quantity: number;
}

interface BinFormRowsProps {
  bins: BinRow[];
  binTypes: BinType[];
  addBinRow: () => void;
  removeBinRow: (index: number) => void;
  handleBinTypeChange: (value: string, index: number) => void;
  handleBinSizeChange: (value: string, index: number) => void;
  handleBinUOMChange: (value: string, index: number) => void;
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
}

const BinFormRows: React.FC<BinFormRowsProps> = ({
  bins,
  binTypes,
  addBinRow,
  removeBinRow,
  handleBinTypeChange,
  handleBinSizeChange,
  handleBinUOMChange,
  handleQuantityChange,
}) => {
  // Get already selected bin type IDs
  const selectedBinTypeIds = bins.map(bin => bin.bin_type_id).filter(id => id);
  
  // Check if all bin types have been selected
  const allBinTypesSelected = selectedBinTypeIds.length === binTypes.length;

  const handleBinSizeInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    // Allow empty string, decimal numbers (including leading decimal point)
    const decimalRegex = /^(\d*\.?\d*)$/;
    if (value === '' || decimalRegex.test(value)) {
      handleBinSizeChange(value, index);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>Bins</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBinRow}
          disabled={allBinTypesSelected}
          title={allBinTypesSelected ? "All bin types have been selected" : "Add a new bin"}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Bin
        </Button>
      </div>
      {bins.map((bin, index) => (
        <div key={index} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor={`bin-type-${index}`}>Bin Type <span className="text-red-500">*</span></Label>
            <Select
              value={bin.bin_type_id}
              onValueChange={(value) => handleBinTypeChange(value, index)}
            >
              <SelectTrigger id={`bin-type-${index}`}>
                <SelectValue placeholder="Select a bin type" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectGroup>
                  {binTypes.map((type) => {
                    const isDisabled = selectedBinTypeIds.includes(type.id) && bin.bin_type_id !== type.id;
                    
                    return (
                      <SelectItem 
                        key={type.id} 
                        value={type.id}
                        disabled={isDisabled}
                        className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {type.name}
                        {isDisabled && " (Already selected)"}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-24">
            <Label htmlFor={`bin-size-${index}`}>Size <span className="text-red-500">*</span></Label>
            <Input
              id={`bin-size-${index}`}
              type="text"
              value={bin.bin_size}
              onChange={(e) => handleBinSizeInputChange(e, index)}
              placeholder="e.g. 240"
              required
            />
          </div>

          <div className="w-20">
            <Label htmlFor={`bin-uom-${index}`}>UOM <span className="text-red-500">*</span></Label>
            <Select
              value={bin.bin_uom}
              onValueChange={(value) => handleBinUOMChange(value, index)}
            >
              <SelectTrigger id={`bin-uom-${index}`}>
                <SelectValue placeholder="UOM" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectGroup>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="m3">m3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <Label htmlFor={`quantity-${index}`}>Quantity <span className="text-red-500">*</span></Label>
            <Input
              id={`quantity-${index}`}
              type="number"
              min={1}
              max={99}
              value={bin.quantity}
              onChange={(e) => handleQuantityChange(e, index)}
              required
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeBinRow(index)}
            disabled={bins.length === 1}
            className="text-red-500 hover:text-red-700 mb-[2px]"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default BinFormRows;
