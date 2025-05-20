
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pen, Trash, Plus } from 'lucide-react';
import { BinType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

interface ContaminationType {
  id: string;
  name: string;
  description: string | null;
  company_id: string | null;
  created_at: string;
  bin_types?: string[];
}

const ContaminationTypes: React.FC = () => {
  const [contaminationTypes, setContaminationTypes] = useState<ContaminationType[]>([]);
  const [binTypes, setBinTypes] = useState<BinType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBinTypes, setSelectedBinTypes] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bin types
      const { data: binTypesData, error: binTypesError } = await supabase
        .from('bin_types')
        .select('*')
        .order('name');
      
      if (binTypesError) throw binTypesError;
      setBinTypes(binTypesData || []);
      
      // Fetch contamination types
      const { data: contaminationData, error: contaminationError } = await supabase
        .from('contamination_types')
        .select('*')
        .eq('company_id', user?.company_id)
        .order('name');
      
      if (contaminationError) throw contaminationError;
      
      // Fetch bin type associations for each contamination type
      const typesWithBins = await Promise.all((contaminationData || []).map(async (type) => {
        const { data: binTypeLinks, error: linkError } = await supabase
          .from('contamination_bin_types' as any)
          .select('bin_type_id')
          .eq('contamination_type_id', type.id);
        
        if (linkError) {
          console.error('Error fetching bin type links:', linkError);
          return { ...type, bin_types: [] };
        }
        
        return {
          ...type,
          bin_types: binTypeLinks?.map((link: any) => link.bin_type_id) || []
        };
      }));
      
      setContaminationTypes(typesWithBins);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Form Incomplete",
        description: "Please enter a name for the contamination type.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedBinTypes.length === 0) {
      toast({
        title: "Form Incomplete",
        description: "Please select at least one bin type.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let contaminationTypeId = editingId;
      
      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('contamination_types')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
        
        if (error) throw error;
        
        // Delete existing bin type associations
        const { error: deleteError } = await supabase
          .from('contamination_bin_types' as any)
          .delete()
          .eq('contamination_type_id', editingId);
        
        if (deleteError) throw deleteError;
        
        toast({
          title: "Updated",
          description: "Contamination type updated successfully.",
        });
      } else {
        // Create new
        const { data, error } = await supabase
          .from('contamination_types')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            company_id: user?.company_id
          })
          .select();
        
        if (error) throw error;
        
        contaminationTypeId = data?.[0]?.id;
        
        toast({
          title: "Created",
          description: "New contamination type created successfully.",
        });
      }
      
      // Insert bin type associations
      if (contaminationTypeId && selectedBinTypes.length > 0) {
        const binTypeLinks = selectedBinTypes.map(binTypeId => ({
          contamination_type_id: contaminationTypeId!,
          bin_type_id: binTypeId
        }));
        
        const { error: linkError } = await supabase
          .from('contamination_bin_types' as any)
          .insert(binTypeLinks);
        
        if (linkError) throw linkError;
      }
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error submitting contamination type:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      // First delete associations
      const { error: linkError } = await supabase
        .from('contamination_bin_types' as any)
        .delete()
        .eq('contamination_type_id', id);
      
      if (linkError) throw linkError;
      
      // Then delete the contamination type
      const { error } = await supabase
        .from('contamination_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: `"${name}" has been deleted successfully.`,
      });
      
      setContaminationTypes(contaminationTypes.filter(item => item.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting contamination type",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSelectedBinTypes([]);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const toggleBinType = (binTypeId: string) => {
    setSelectedBinTypes(prev => 
      prev.includes(binTypeId)
        ? prev.filter(id => id !== binTypeId)
        : [...prev, binTypeId]
    );
  };

  const getBinTypeNames = (binTypeIds: string[] = []) => {
    if (!binTypeIds.length) return '-';
    
    return binTypeIds
      .map(id => binTypes.find(type => type.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contamination Types</h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Contamination Type' : 'Add New Contamination Type'}
              </DialogTitle>
              <DialogDescription>
                Link this contamination type to specific bin types.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Food waste, Plastic, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
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
                      <Label 
                        htmlFor={`bin-type-${binType.id}`}
                        className="font-normal cursor-pointer"
                      >
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
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Contamination Types</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : contaminationTypes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No contamination types found. Add your first one to get started.
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

export default ContaminationTypes;
