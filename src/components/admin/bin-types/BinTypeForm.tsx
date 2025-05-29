
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { BinType, BinTypeFormData } from "@/types/binTypes";

interface BinTypeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBinType?: BinType | null;
  onSubmit: (formData: BinTypeFormData, editingId?: string) => Promise<void>;
  onCheckDuplicate: (formData: BinTypeFormData, editingId?: string) => Promise<boolean>;
}

export const BinTypeForm: React.FC<BinTypeFormProps> = ({
  open,
  onOpenChange,
  editingBinType,
  onSubmit,
  onCheckDuplicate,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [binSize, setBinSize] = useState("");
  const [binUOM, setBinUOM] = useState("");

  useEffect(() => {
    if (editingBinType) {
      setName(editingBinType.name);
      setColor(editingBinType.color || "");
      setIcon(editingBinType.icon || "");
      setBinSize(editingBinType.bin_size || "");
      setBinUOM(editingBinType.bin_uom || "");
    } else {
      resetForm();
    }
  }, [editingBinType]);

  const resetForm = () => {
    setName("");
    setColor("");
    setIcon("");
    setBinSize("");
    setBinUOM("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Name is required.", variant: "destructive" });
      return;
    }
    if (!binSize.trim()) {
      toast({ title: "Missing bin size", description: "Bin size is required.", variant: "destructive" });
      return;
    }
    if (!binUOM.trim()) {
      toast({ title: "Missing UOM", description: "Unit of measurement is required.", variant: "destructive" });
      return;
    }

    const formData: BinTypeFormData = {
      name,
      color,
      icon,
      binSize,
      binUOM,
    };

    try {
      const isDuplicate = await onCheckDuplicate(formData, editingBinType?.id);
      
      if (isDuplicate) {
        toast({ 
          title: "Duplicate bin type", 
          description: "A bin type with this name, size and UOM already exists.", 
          variant: "destructive" 
        });
        return;
      }

      await onSubmit(formData, editingBinType?.id);
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBinType ? "Edit Bin Type" : "Add New Bin Type"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="binSize">Bin Size <span className="text-red-500">*</span></Label>
              <Input 
                id="binSize" 
                value={binSize} 
                onChange={e => setBinSize(e.target.value)} 
                placeholder="E.g. 80, 140, 240" 
                required
              />
            </div>
            <div>
              <Label htmlFor="binUOM">UOM <span className="text-red-500">*</span></Label>
              <Input 
                id="binUOM" 
                value={binUOM} 
                onChange={e => setBinUOM(e.target.value)} 
                placeholder="E.g. L, kg, m³" 
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="color">Color (hex or name, optional)</Label>
            <Input id="color" value={color} onChange={e => setColor(e.target.value)} placeholder="#009900 / green" />
          </div>
          <div>
            <Label htmlFor="icon">Icon (optional)</Label>
            <Input id="icon" value={icon} onChange={e => setIcon(e.target.value)} placeholder="E.g. trash" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editingBinType ? "Update" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
