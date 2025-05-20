import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

interface Company {
  id: string;
  name: string;
  address: string | null;
  abn: string | null;
  created_at: string;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyABN, setCompanyABN] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editABN, setEditABN] = useState('');
  const { user, isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Companies table has these columns based on the schema
      const typedCompanies: Company[] = (data || []).map(company => ({
        id: company.id,
        name: company.name,
        address: company.address || null,
        abn: company.abn || null,
        created_at: company.created_at
      }));
      
      setCompanies(typedCompanies);
    } catch (error: any) {
      toast({
        title: 'Error fetching companies',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .insert({ 
          name: companyName.trim(),
          address: companyAddress.trim() || null,
          abn: companyABN.trim() || null
        });
        
      if (error) throw error;
      
      setCompanyName('');
      setCompanyAddress('');
      setCompanyABN('');
      toast({
        title: 'Company created',
        description: `${companyName} has been added successfully.`,
      });
      
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: 'Error creating company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingId) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          name: editName.trim(),
          address: editAddress.trim() || null,
          abn: editABN.trim() || null 
        })
        .eq('id', editingId);
        
      if (error) throw error;
      
      setEditingId(null);
      toast({
        title: 'Company updated',
        description: `Company has been updated successfully.`,
      });
      
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: 'Error updating company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    // Prevent deleting Nuloop company if user is super admin
    if (name === 'Nuloop' && isSuperAdmin) {
      toast({
        title: 'Cannot delete Nuloop',
        description: 'The Nuloop company cannot be deleted as it is reserved for super admins.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Company deleted',
        description: `${name} has been deleted successfully.`,
      });
      
      fetchCompanies();
    } catch (error: any) {
      toast({
        title: 'Error deleting company',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEdit = (company: Company) => {
    // Prevent editing Nuloop company if user is not super admin
    if (company.name === 'Nuloop' && !isSuperAdmin) {
      toast({
        title: 'Cannot edit Nuloop',
        description: 'The Nuloop company can only be edited by super admins.',
        variant: 'destructive',
      });
      return;
    }
    
    setEditingId(company.id);
    setEditName(company.name);
    setEditAddress(company.address || '');
    setEditABN(company.abn || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Companies Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  type="text"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  type="text"
                  placeholder="Address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">ABN</label>
                <Input
                  type="text"
                  placeholder="ABN"
                  value={companyABN}
                  onChange={(e) => setCompanyABN(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit">Add Company</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading companies...</div>
          ) : companies.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No companies found. Add your first company above.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>ABN</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      {editingId === company.id ? (
                        <Input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          autoFocus
                        />
                      ) : (
                        company.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === company.id ? (
                        <Input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                        />
                      ) : (
                        company.address || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === company.id ? (
                        <Input
                          type="text"
                          value={editABN}
                          onChange={(e) => setEditABN(e.target.value)}
                        />
                      ) : (
                        company.abn || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(company.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === company.id ? (
                        <form onSubmit={handleUpdateCompany} className="flex gap-2 justify-end">
                          <Button type="submit" size="sm">Save</Button>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(company)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCompany(company.id, company.name)}
                            className="text-red-500 hover:text-red-700"
                            disabled={company.name === 'Nuloop' && isSuperAdmin}
                          >
                            Delete
                          </Button>
                        </>
                      )}
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

export default Companies;
