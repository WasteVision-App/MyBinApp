
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BinFormRows from "./BinFormRows";
import { BinType } from "@/types";

interface BinRow {
  id?: string;
  bin_type_id: string;
  quantity: number;
}

interface BinTallyFormDetailsProps {
  formData: {
    title: string;
    description: string;
    location: string;
    area: string;
    bins: BinRow[];
  };
  binTypes: BinType[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBinTypeChange: (value: string, index: number) => void;
  handleQuantityChange: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  addBinRow: () => void;
  removeBinRow: (index: number) => void;
}

const BinTallyFormDetails: React.FC<BinTallyFormDetailsProps> = ({
  formData,
  binTypes,
  handleInputChange,
  handleBinTypeChange,
  handleQuantityChange,
  addBinRow,
  removeBinRow,
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="title" className="required">
        Title <span className="text-red-500">*</span>
      </Label>
      <Input
        id="title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter form title"
        required
      />
    </div>

    <div>
      <Label htmlFor="location" className="required">
        Location <span className="text-red-500">*</span>
      </Label>
      <Input
        id="location"
        name="location"
        value={formData.location}
        onChange={handleInputChange}
        placeholder="Enter location"
        required
      />
    </div>
    
    <div>
      <Label htmlFor="area" className="required">
        Area <span className="text-red-500">*</span>
      </Label>
      <Input
        id="area"
        name="area"
        value={formData.area}
        onChange={handleInputChange}
        placeholder="Enter area"
        required
      />
    </div>

    <div>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Enter description (optional)"
        rows={3}
      />
    </div>

    <BinFormRows
      bins={formData.bins}
      binTypes={binTypes}
      addBinRow={addBinRow}
      removeBinRow={removeBinRow}
      handleBinTypeChange={handleBinTypeChange}
      handleQuantityChange={handleQuantityChange}
    />
  </div>
);

export default BinTallyFormDetails;
