
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pen, Trash, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BinType {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  bin_size?: string;
}

const AdminBinTypes: React.FC = () => {
  const [binTypes, setBinTypes] = useState<BinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [binSize, setBinSize] = useState("");
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    if (isSuperAdmin) fetchBinTypes();
  }, [isSuperAdmin]);

  const fetchBinTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("bin_types").select("*").order("name");
    if (error) {
      toast({ title: "Error fetching bin types", description: error.message, variant: "destructive" });
    } else {
      setBinTypes(data || []);
    }
    setLoading(false);
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

    try {
      // Check for duplicate bin type (same name AND bin size combination)
      const { data: existingBins, error: checkError } = await supabase
        .from("bin_types")
        .select("id")
        .eq("name", name.trim())
        .eq("bin_size", binSize.trim());
      
      if (checkError) throw checkError;
      
      // If editing, we need to exclude the current bin from the duplicate check
      const isDuplicate = existingBins && existingBins.length > 0 && 
                          (!editingId || existingBins.some(bin => bin.id !== editingId));
      
      if (isDuplicate) {
        toast({ 
          title: "Duplicate bin type", 
          description: "A bin type with this name and size already exists.", 
          variant: "destructive" 
        });
        return;
      }

      if (editingId) {
        const { error } = await supabase.from("bin_types").update({
          name: name.trim(),
          color: color.trim() || null,
          icon: icon.trim() || null,
          bin_size: binSize.trim(),
        }).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Updated", description: "Bin type updated successfully." });
      } else {
        const { error } = await supabase.from("bin_types").insert([{
          name: name.trim(),
          color: color.trim() || null,
          icon: icon.trim() || null,
          bin_size: binSize.trim(),
        }]);
        if (error) throw error;
        toast({ title: "Created", description: "Bin type created successfully." });
      }
      setDialogOpen(false);
      resetForm();
      fetchBinTypes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (type: BinType) => {
    setEditingId(type.id);
    setName(type.name);
    setColor(type.color || "");
    setIcon(type.icon || "");
    setBinSize(type.bin_size || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this bin type?")) return;
    const { error } = await supabase.from("bin_types").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Bin type deleted." });
      setBinTypes(binTypes.filter((b) => b.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setColor("");
    setIcon("");
    setBinSize("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  if (!isSuperAdmin) return <div className="text-center py-10 text-muted-foreground">Super admin only.</div>;

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Bin Type" : "Add New Bin Type"}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="binSize">Bin Size <span className="text-red-500">*</span></Label>
                <Input 
                  id="binSize" 
                  value={binSize} 
                  onChange={e => setBinSize(e.target.value)} 
                  placeholder="E.g. 80L, 140L, 240L" 
                  required
                />
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
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Bin Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Loading...</div> : (
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
                    <TableCell>{bin.bin_size || "-"}</TableCell>
                    <TableCell>{bin.color || "-"}</TableCell>
                    <TableCell>{bin.icon || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(bin)} className="mr-1">
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
    </div>
  );
};

export default AdminBinTypes;
