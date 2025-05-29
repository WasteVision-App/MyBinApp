
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { FormData } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useFetchFormData = (currentForm: FormData | null) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const fetchInProgress = useRef(false);

  const fetchFormData = useCallback(async () => {
    if (!currentForm || fetchInProgress.current) {
      return null;
    }
    
    try {
      fetchInProgress.current = true;
      setLoading(true);
      
      // Determine if we're using an access code or form ID
      const isUsingAccessCode = Boolean(currentForm.access_code);
      const isUsingFormId = Boolean(currentForm.form_id);
      
      console.log(isUsingAccessCode ? 'Fetching form data for code:' : 'Fetching form data for ID:', 
        isUsingAccessCode ? currentForm.access_code : currentForm.form_id);

      let formId = '';
      
      // Look for direct form match by unique_code (for short codes like 7PYWOK)
      if (isUsingFormId) {
        const formIdValue = currentForm.form_id || '';
        
        // Check if the form ID is a UUID pattern or potentially a unique_code
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formIdValue);
        
        if (isUuid) {
          // If it's a UUID, use it directly
          formId = formIdValue;
          console.log('Using UUID form ID directly:', formId);
        } else {
          // If not a UUID, try to find form by unique_code
          console.log('Looking up form by unique_code:', formIdValue);
          const { data: formByCode, error: formCodeError } = await supabase
            .from('bin_tally_forms')
            .select('id')
            .eq('unique_code', formIdValue)
            .maybeSingle();
            
          if (formByCode) {
            console.log('Found form by unique_code:', formByCode);
            formId = formByCode.id;
          } else {
            console.log('No form found by unique_code, checking if it might be an access code');
            
            // If not found by unique_code, check if it might be an access code
            const { data: invitation } = await supabase
              .from('invitations')
              .select('form_id')
              .eq('access_code', formIdValue)
              .eq('status', 'active')
              .maybeSingle();
              
            if (invitation) {
              console.log('Found invitation with access code:', formIdValue);
              formId = invitation.form_id;
            } else {
              throw new Error('Invalid form ID or access code');
            }
          }
        }
      }
      // Access code handling
      else if (isUsingAccessCode && currentForm.access_code) {
        // Get invitation data when using access code
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('form_id')
          .eq('access_code', currentForm.access_code)
          .eq('status', 'active')
          .maybeSingle();

        if (invitationError || !invitation) {
          console.error('Invalid invitation:', invitationError || 'No invitation found');
          throw new Error('Invalid access code');
        }
        
        formId = invitation.form_id;
      }

      if (!formId) {
        throw new Error('Could not determine form ID');
      }

      console.log('Fetching form data with ID:', formId);
      
      // Get form data using the form_id - Now including both bin_size and bin_uom in the query
      // Force cache refresh with timestamp parameter to prevent caching
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('bin_tally_forms')
        .select(`
          id,
          title,
          location,
          description,
          unique_code,
          company_id,
          area,
          companies (
            id,
            name,
            address
          ),
          form_bins (
            id,
            quantity,
            bin_types (
              id,
              name,
              color,
              icon,
              bin_size,
              bin_uom
            )
          )
        `)
        .eq('id', formId)
        .maybeSingle();

      if (error || !data) {
        console.error('Form data error:', error || 'No form data found');
        throw new Error('Form not found');
      }
      
      console.log('Successfully fetched form data:', data);
      return data;
    } catch (error: any) {
      console.error('Error fetching form data:', error);
      toast({
        title: "Error Loading Form",
        description: error.message || "Failed to load the form. Please try again.",
        variant: "destructive",
      });
      navigate('/');
      return null;
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [currentForm, navigate]);

  return {
    fetchFormData,
    loading,
    setLoading
  };
};
