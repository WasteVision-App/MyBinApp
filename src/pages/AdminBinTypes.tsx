
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BinTypeForm } from "@/components/admin/bin-types/BinTypeForm";
import { BinTypesTable } from "@/components/admin/bin-types/BinTypesTable";
import { useBinTypes } from "@/components/admin/bin-types/useBinTypes";
import { BinType, BinTypeFormData } from "@/types/binTypes";

const AdminBinTypes: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBinType, setEditingBinType] = useState<BinType | null>(null);
  const { isSuperAdmin } = useAuth();
  
  const {
    binTypes,
    loading,
    createBinType,
    updateBinType,
    deleteBinType,
    checkDuplicate,
  } = useBinTypes();

  const handleEdit = (binType: BinType) => {
    setEditingBinType(binType);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: BinTypeFormData, editingId?: string) => {
    if (editingId) {
      await updateBinType(editingId, formData);
    } else {
      await createBinType(formData);
    }
    setEditingBinType(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingBinType(null);
    }
  };

  if (!isSuperAdmin) {
    return <div className="text-center py-10 text-muted-foreground">Super admin only.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bin Types Management</h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add New Bin Type
            </Button>
          </DialogTrigger>
          <BinTypeForm
            open={dialogOpen}
            onOpenChange={handleDialogOpenChange}
            editingBinType={editingBinType}
            onSubmit={handleSubmit}
            onCheckDuplicate={checkDuplicate}
          />
        </Dialog>
      </div>
      
      <BinTypesTable
        binTypes={binTypes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={deleteBinType}
      />
    </div>
  );
};

export default AdminBinTypes;
