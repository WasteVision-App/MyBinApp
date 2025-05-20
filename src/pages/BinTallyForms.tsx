import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Pen, Trash, Users, Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface BinTallyForm {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  area: string | null;
  unique_code: string;
  created_at: string;
  updated_at: string;
  company_name: string | null;
  company_id: string | null;
}

const BinTallyForms: React.FC = () => {
  const [forms, setForms] = useState<BinTallyForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<BinTallyForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyFilter = queryParams.get('company');

  useEffect(() => {
    fetchForms();
  }, [user, isSuperAdmin, companyFilter]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredForms(forms);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = forms.filter(form => 
        form.title.toLowerCase().includes(query) ||
        (form.location && form.location.toLowerCase().includes(query)) ||
        (form.area && form.area.toLowerCase().includes(query)) ||
        (form.description && form.description.toLowerCase().includes(query)) ||
        form.unique_code.toLowerCase().includes(query) ||
        (form.company_name && form.company_name.toLowerCase().includes(query))
      );
      setFilteredForms(filtered);
    }
  }, [searchQuery, forms]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('bin_tally_forms')
        .select(`
          id,
          title,
          description,
          location,
          area,
          unique_code,
          created_at,
          updated_at,
          company_id
        `)
        .order('updated_at', { ascending: false });

      // If not super admin, filter by company_id
      if (!isSuperAdmin && user?.company_id) {
        query = query.eq('company_id', user.company_id);
      } 
      
      // If company filter is provided from the URL
      if (companyFilter) {
        query = query.eq('company_id', companyFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch company names if super admin
      if (data) {
        const formsWithCompanyNames = await Promise.all(
          data.map(async (form: any) => {
            let companyName: string | null = null;
            
            if (form.company_id) {
              const { data: companyData } = await supabase
                .from('companies')
                .select('name')
                .eq('id', form.company_id)
                .single();
              
              companyName = companyData?.name || null;
            }
            
            return {
              id: form.id,
              title: form.title,
              description: form.description,
              location: form.location,
              area: form.area,
              unique_code: form.unique_code,
              created_at: form.created_at,
              updated_at: form.updated_at,
              company_name: companyName,
              company_id: form.company_id
            };
          })
        );
        
        setForms(formsWithCompanyNames);
        setFilteredForms(formsWithCompanyNames);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching forms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      // First delete all related form_bins
      const { error: binsError } = await supabase
        .from('form_bins')
        .delete()
        .eq('form_id', id);
      
      if (binsError) {
        console.error('Error deleting form bins:', binsError);
        throw binsError;
      }
      
      // Then delete all related invitations
      const { error: invitationsError } = await supabase
        .from('invitations')
        .delete()
        .eq('form_id', id);
      
      if (invitationsError) {
        console.error('Error deleting form invitations:', invitationsError);
        throw invitationsError;
      }
      
      // Check for form submissions and delete them if they exist
      const { error: submissionsError } = await supabase
        .from('form_submissions')
        .delete()
        .eq('form_id', id);
      
      if (submissionsError) {
        console.error('Error deleting form submissions:', submissionsError);
        throw submissionsError;
      }

      // Finally delete the form itself
      const { error } = await supabase
        .from('bin_tally_forms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      toast({
        title: "Form deleted",
        description: `"${title}" has been deleted successfully.`,
      });

      setForms(forms.filter(form => form.id !== id));
      setFilteredForms(filteredForms.filter(form => form.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting form",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInviteUsers = (id: string, title: string) => {
    navigate(`/site-admin/bin-tally-forms/${id}/invite`);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {companyFilter 
            ? `Bin Tally Forms${forms.length > 0 ? ` for ${forms[0].company_name}` : ''}`
            : 'Bin Tally Forms'
          }
        </h1>
        <Button onClick={() => navigate('/site-admin/bin-tally-forms/new')} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      </div>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search forms by title, location, area, or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bin Tally Forms</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading forms...</div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {forms.length === 0 ? 
                "No forms found. Create your first bin tally form to get started." : 
                "No forms matching your search criteria."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Code</TableHead>
                  {isSuperAdmin && <TableHead>Company</TableHead>}
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.title}</TableCell>
                    <TableCell>{form.location || "-"}</TableCell>
                    <TableCell>{form.area || "-"}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {form.unique_code}
                      </code>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell>{form.company_name || "-"}</TableCell>
                    )}
                    <TableCell>{formatDate(form.updated_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/site-admin/bin-tally-forms/${form.id}`)}
                        className="mr-1"
                      >
                        <Pen className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInviteUsers(form.id, form.title)}
                        className="mr-1"
                      >
                        <Users className="w-4 h-4 mr-1" />
                        Invite
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id, form.title)}
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

export default BinTallyForms;
