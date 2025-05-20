
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyAdded: () => void;
}

const AddCompanyDialog: React.FC<AddCompanyDialogProps> = ({ open, onOpenChange, onCompanyAdded }) => {
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyABN, setCompanyABN] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("companies").insert({
        name: companyName.trim(),
        address: companyAddress.trim() || null,
        abn: companyABN.trim() || null,
      });
      if (error) throw error;

      setCompanyName("");
      setCompanyAddress("");
      setCompanyABN("");
      toast({
        title: "Company created",
        description: `${companyName} has been added successfully.`,
      });
      onOpenChange(false);
      onCompanyAdded();
    } catch (error: any) {
      toast({
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Company Name</label>
            <Input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <Input
              type="text"
              placeholder="Address"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">ABN</label>
            <Input
              type="text"
              placeholder="ABN"
              value={companyABN}
              onChange={(e) => setCompanyABN(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Company"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyDialog;
