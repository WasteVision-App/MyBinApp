
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { BinType } from '@/types';
import FormHeader from "@/components/FormHeader";
import BinTallyFormDetails from "@/components/BinTallyFormDetails";

interface BinTallyFormData {
  title: string;
  description: string;
  location: string;
  area: string;
  bins: {
    id?: string;
    bin_type_id: string;
    quantity: number;
  }[];
}

// Interface for bin tally form from database
interface BinTallyFormDB {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  area: string | null;
  unique_code: string;
  created_at: string;
  updated_at: string;
  company_id: string;
  created_by: string;
}

const BinTallyFormEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined && id !== 'new';
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  
  const [formData, setFormData] = useState<BinTallyFormData>({
    title: '',
    description: '',
    location: '',
    area: '',
    bins: [{ bin_type_id: '', quantity: 1 }]
  });
  
  const [binTypes, setBinTypes] = useState<BinType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);

  useEffect(() => {
    const fetchBinTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('bin_types')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setBinTypes(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching bin types",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchBinTypes();
  }, []);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!isEditing) return;
      try {
        setFetchingData(true);
        const { data, error } = await supabase
          .from('bin_tally_forms')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          const formData = data as BinTallyFormDB;
          const { data: formBins, error: binsError } = await supabase
            .from('form_bins')
            .select('*')
            .eq('form_id', id);
          if (binsError) throw binsError;
          setFormData({
            title: formData.title,
            description: formData.description || '',
            location: formData.location || '',
            area: formData.area || '',
            bins: formBins?.length 
              ? formBins.map(bin => ({
                  id: bin.id,
                  bin_type_id: bin.bin_type_id,
                  quantity: bin.quantity
                }))
              : [{ bin_type_id: '', quantity: 1 }]
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching form data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchFormData();
  }, [id, isEditing]);
  
  useEffect(() => {
    if (isSuperAdmin) {
      const inputs = document.querySelectorAll('input, textarea, select, button[type="submit"]');
      inputs.forEach((input: any) => {
        input.disabled = true;
      });
    }
  }, [isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBinTypeChange = (value: string, index: number) => {
    const updatedBins = [...formData.bins];
    updatedBins[index].bin_type_id = value;
    setFormData(prev => ({ ...prev, bins: updatedBins }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let value = parseInt(e.target.value) || 1;
    value = Math.max(1, Math.min(10, value));
    const updatedBins = [...formData.bins];
    updatedBins[index].quantity = value;
    setFormData(prev => ({ ...prev, bins: updatedBins }));
  };

  const addBinRow = () => {
    setFormData(prev => ({
      ...prev,
      bins: [...prev.bins, { bin_type_id: '', quantity: 1 }]
    }));
  };

  const removeBinRow = (index: number) => {
    if (formData.bins.length === 1) return;
    const updatedBins = [...formData.bins];
    updatedBins.splice(index, 1);
    setFormData(prev => ({ ...prev, bins: updatedBins }));
  };

  const generateUniqueCode = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('generate_random_code', { length: 6 });
      
      if (error) throw error;
      
      if (data) {
        return data;
      } else {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    } catch (error) {
      console.error('Error generating code:', error);
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Form Incomplete",
        description: "Please enter a title for the form.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.location.trim()) {
      toast({
        title: "Form Incomplete",
        description: "Please enter a location for the form.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.area.trim()) {
      toast({
        title: "Form Incomplete",
        description: "Please enter an area for the form.",
        variant: "destructive",
      });
      return;
    }
    if (formData.bins.some(bin => !bin.bin_type_id)) {
      toast({
        title: "Form Incomplete",
        description: "Please select a bin type for all bins.",
        variant: "destructive",
      });
      return;
    }
    const invalidBin = formData.bins.find(bin => isNaN(bin.quantity) || bin.quantity < 1 || bin.quantity > 10);
    if (invalidBin) {
      toast({
        title: "Invalid Bin Quantity",
        description: "Quantity must be between 1 and 10 for all bins.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const { error: formError } = await supabase
          .from('bin_tally_forms')
          .update({
            title: formData.title,
            description: formData.description || null,
            location: formData.location || null,
            area: formData.area || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (formError) throw formError;

        for (const bin of formData.bins) {
          if (bin.id) {
            const { error } = await supabase
              .from('form_bins')
              .update({
                bin_type_id: bin.bin_type_id,
                quantity: bin.quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', bin.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('form_bins')
              .insert({
                form_id: id,
                bin_type_id: bin.bin_type_id,
                quantity: bin.quantity
              });
            if (error) throw error;
          }
        }

        if (formData.bins.length > 0) {
          const existingBinIds = formData.bins
            .filter(bin => bin.id)
            .map(bin => bin.id);
          if (existingBinIds.length > 0) {
            const { error } = await supabase
              .from('form_bins')
              .delete()
              .eq('form_id', id)
              .not('id', 'in', `(${existingBinIds.join(',')})`);
            if (error) throw error;
          }
        }

        toast({
          title: "Form Updated",
          description: "The bin tally form has been updated successfully.",
        });
      } else {
        const uniqueCode = await generateUniqueCode();

        const { data: newForm, error: formError } = await supabase
          .from('bin_tally_forms')
          .insert({
            title: formData.title,
            description: formData.description || null,
            location: formData.location,
            area: formData.area,
            unique_code: uniqueCode,
            company_id: user?.company_id,
            created_by: user?.id
          })
          .select();
        
        if (formError) {
          console.error('Form creation error:', formError);
          throw formError;
        }
        
        if (newForm && newForm.length > 0) {
          const newFormId = newForm[0].id;
          const binsToInsert = formData.bins.map(bin => ({
            form_id: newFormId,
            bin_type_id: bin.bin_type_id,
            quantity: bin.quantity
          }));
          
          const { error: binsError } = await supabase
            .from('form_bins')
            .insert(binsToInsert);
            
          if (binsError) {
            console.error('Bins insertion error:', binsError);
            throw binsError;
          }
        }

        toast({
          title: "Form Created",
          description: "The bin tally form has been created successfully.",
        });
      }
      navigate('/site-admin/bin-tally-forms');
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: isEditing ? "Error updating form" : "Error creating form",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="text-center py-8">
        Loading form data...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FormHeader isEditing={isEditing} />
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
          {isSuperAdmin && (
            <p className="text-sm text-muted-foreground">
              View only mode - Super admins can only view form details
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <BinTallyFormDetails
              formData={formData}
              binTypes={binTypes}
              handleInputChange={handleInputChange}
              handleBinTypeChange={handleBinTypeChange}
              handleQuantityChange={handleQuantityChange}
              addBinRow={addBinRow}
              removeBinRow={removeBinRow}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/site-admin/bin-tally-forms')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditing ? 'Update Form' : 'Create Form'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BinTallyFormEdit;
