
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AccessCodeFormProps {
  onSubmitSuccess?: (data: any) => void;
}

const AccessCodeForm: React.FC<AccessCodeFormProps> = ({ onSubmitSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [_, setFormData] = useLocalStorage('currentForm', null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Access Code Required",
        description: "Please enter an access code to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      console.log('Validating input:', accessCode.trim());
      
      // Check if the input is a form ID (UUID format) or an access code
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUuid = uuidRegex.test(accessCode.trim());
      
      // Handle direct form ID (UUID format)
      if (isUuid) {
        console.log('Input appears to be a UUID form ID');
        
        const { data: formExists, error: formError } = await supabase
          .from('bin_tally_forms')
          .select('id')
          .eq('id', accessCode.trim())
          .maybeSingle();
        
        if (formError || !formExists) {
          toast({
            title: "Invalid Form ID",
            description: "The form ID you entered does not exist.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Store form ID directly
        const formData = {
          form_id: accessCode.trim()
        };
        
        setFormData(formData);
        console.log('Saving form ID to localStorage:', formData);
        
        toast({
          title: "Access Granted",
          description: "You now have access to the form.",
        });
        
        // Call onSubmitSuccess if provided (for inline form rendering)
        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        } else {
          // Navigate to the form if not inline
          navigate('/bin-tally-form');
        }
        return;
      }
      
      // Check if the input is a form's unique_code (like 7PYWOK)
      const { data: formByUniqueCode, error: uniqueCodeError } = await supabase
        .from('bin_tally_forms')
        .select('id')
        .eq('unique_code', accessCode.trim())
        .maybeSingle();
      
      if (formByUniqueCode) {
        console.log('Found form by unique_code:', formByUniqueCode);
        
        // Store form ID directly
        const formData = {
          form_id: accessCode.trim() // Store the unique_code as form_id
        };
        
        setFormData(formData);
        console.log('Saving unique_code as form_id to localStorage:', formData);
        
        toast({
          title: "Access Granted",
          description: "You now have access to the form.",
        });
        
        // Call onSubmitSuccess if provided (for inline form rendering)
        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        } else {
          // Navigate to the form if not inline
          navigate('/bin-tally-form');
        }
        return;
      }
      
      // If not found, check if the input might be an invitation code
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('access_code', accessCode.trim())
        .eq('status', 'active')
        .maybeSingle();
      
      if (!invitationError && invitation) {
        console.log('Found invitation with access code:', invitation);
        
        // Store as access code
        const formData = {
          access_code: invitation.access_code,
          form_id: invitation.form_id
        };
        
        setFormData(formData);
        console.log('Saving access code to localStorage:', formData);
        
        toast({
          title: "Access Granted",
          description: "You now have access to the form.",
        });
        
        // Call onSubmitSuccess if provided (for inline form rendering)
        if (onSubmitSuccess) {
          onSubmitSuccess(formData);
        } else {
          // Navigate to the form if not inline
          navigate('/bin-tally-form');
        }
        return;
      }
      
      // If we reach here, we couldn't validate the code or ID
      console.error('Invalid access code or form ID:', accessCode.trim());
      toast({
        title: "Invalid Code",
        description: "The code you entered is not valid. Please check and try again.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error validating access code:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">Enter Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter access code or form ID"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default AccessCodeForm;
