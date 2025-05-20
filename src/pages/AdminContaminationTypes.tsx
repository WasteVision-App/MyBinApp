
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pen, Trash, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';

interface BinType {
  id: string;
  name: string;
}

interface ContaminationType {
  id: string;
  name: string;
  description: string | null;
  bin_types?: string[];
}

const AdminContaminationTypes: React.FC = () => {
  const [contaminationTypes, setContaminationTypes] = useState<ContaminationType[]>([]);
  const [binTypes, setBinTypes] = useState<BinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBinTypes, setSelectedBinTypes] = useState<string[]>([]);
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    if (isSuperAdmin) fetchData();
    // eslint-disable-next-line
  }, [isSuperAdmin]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch bin types
    const { data: binTypesData, error: binTypesError } = await supabase
      .from('bin_types')
      .select('*')
      .order('name');
    if (binTypesError) {
      toast({ title: "Error fetching bin types", description: binTypesError.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setBinTypes(binTypesData || []);

    // Fetch contamination types
    const { data: contaminationData, error: contaminationError } = await supabase
      .from('contamination_types')
      .select('*')
      .order('name');
    if (contaminationError) {
      toast({ title: "Error fetching contamination types", description: contaminationError.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch bin type associations for each contamination type
    const typesWithBins = await Promise.all((contaminationData || []).map(async (type) => {
      const { data: binTypeLinks } = await supabase
        .from('contamination_bin_types' as any)
        .select('bin_type_id')
        .eq('contamination_type_id', type.id);
      return {
        ...type,
        bin_types: binTypeLinks?.map((link: any) => link.bin_type_id) || []
      };
    }));

    setContaminationTypes(typesWithBins);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Missing name", description: "Name is required.", variant: "destructive" });
      return;
    }
    if (selectedBinTypes.length === 0) {
      toast({ title: "Form incomplete", description: "Select at least one bin type.", variant: "destructive" });
      return;
    }
    try {
      let contaminationTypeId = editingId;

      if (editingId) {
        const { error } = await supabase
          .from('contamination_types')
          .update({ name: name.trim(), description: description.trim() || null })
          .eq('id', editingId);
        if (error) throw error;

        // Delete old bin type associations
        const { error: deleteError } = await supabase
          .from('contamination_bin_types' as any)
          .delete()
          .eq('contamination_type_id', editingId);
        if (deleteError) throw deleteError;

        toast({ title: "Updated", description: "Contamination type updated." });
      } else {
        const { data, error } = await supabase
          .from('contamination_types')
          .insert({ name: name.trim(), description: description.trim() || null })
          .select();
        if (error) throw error;
        contaminationTypeId = data?.[0]?.id;
        toast({ title: "Created", description: "Contamination type created." });
      }

      // Link bin types
      if (contaminationTypeId && selectedBinTypes.length > 0) {
        const binTypeLinks = selectedBinTypes.map((binTypeId) => ({
          contamination_type_id: contaminationTypeId!,
          bin_type_id: binTypeId,
        }));
        const { error: linkError } = await supabase
          .from('contamination_bin_types' as any)
          .insert(binTypeLinks);
        if (linkError) throw linkError;
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (item: ContaminationType) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setSelectedBinTypes(item.bin_types || []);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    // Remove links first
    const { error: linkError } = await supabase.from('contamination_bin_types' as any).delete().eq('contamination_type_id', id);
    if (linkError) {
      toast({ title: "Error", description: linkError.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from('contamination_types').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: `"${name}" has been deleted.` });
      setContaminationTypes(contaminationTypes.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setSelectedBinTypes([]);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const toggleBinType = (id: string) => {
    setSelectedBinTypes(prev =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const getBinTypeNames = (binTypeIds: string[] = []) => {
    if (!binTypeIds.length) return '-';
    return binTypeIds
      .map(id => binTypes.find(type => type.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (!isSuperAdmin) return <div className="text-center py-10 text-muted-foreground">Super admin only.</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contamination Types Management</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            title="Refresh contamination types"
          >
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add New Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Contamination Type" : "Add New Contamination Type"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Applicable Bin Types</Label>
                  <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {binTypes.map((binType) => (
                      <div key={binType.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`bin-type-${binType.id}`}
                          checked={selectedBinTypes.includes(binType.id)}
                          onCheckedChange={() => toggleBinType(binType.id)}
                        />
                        <Label htmlFor={`bin-type-${binType.id}`} className="font-normal cursor-pointer">
                          {binType.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Contamination Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : contaminationTypes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No contamination types found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Applicable Bin Types</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contaminationTypes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{getBinTypeNames(item.bin_types)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="mr-1"
                      >
                        <Pen className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4 mr-1" />
                        Delete
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

export default AdminContaminationTypes;
