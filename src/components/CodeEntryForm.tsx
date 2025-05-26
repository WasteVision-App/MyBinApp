import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CodeEntryForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize the code (uppercase, remove spaces, keep only alphabetic characters)
    const normalizedCode = code.toUpperCase().replace(/[^A-Z]/g, '');
    setLoading(true);
    
    try {
      console.log('Validating input:', normalizedCode);
      
      // Try to find form by unique_code first
      const { data: formByCode, error: formCodeError } = await supabase
        .from('bin_tally_forms')
        .select('id')
        .eq('unique_code', normalizedCode)
        .maybeSingle();
      
      if (formByCode) {
        console.log('Found form by unique_code:', formByCode);
        // Store form ID in localStorage and navigate to form
        localStorage.setItem('currentForm', JSON.stringify({ form_id: normalizedCode }));
        console.log('Saving unique_code as form_id to localStorage:', { form_id: normalizedCode });
        navigate('/bin-tally-form');
        return;
      }
      
      // If not found by unique_code, check if it might be an access code
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('form_id')
        .eq('access_code', normalizedCode)
        .eq('status', 'active')
        .maybeSingle();
        
      if (invitation) {
        // Store access code in localStorage and navigate to form
        localStorage.setItem('currentForm', JSON.stringify({ access_code: normalizedCode }));
        navigate('/bin-tally-form');
        return;
      }
      
      // If neither found as form code nor access code
      toast({
        title: "Invalid Code",
        description: "The code you entered doesn't exist. Please check and try again.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error validating code:', error);
      toast({
        title: "Error",
        description: "Failed to validate code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mybin-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-mybin-primary">MyBin.App</h1>
        <p className="text-mybin-gray">Enter your code to begin</p>
      </div>
      
      <div className="mybin-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="code" className="mybin-label">
              Enter Code
            </label>
            <Input
              id="code"
              className="mybin-input uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              placeholder="e.g., ABCDEF"
              required
              maxLength={8}
            />
          </div>
          
          <Button 
            type="submit" 
            className="mybin-btn-primary w-full"
            disabled={loading || !code.trim()}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>
        </form>
        
        <div className="mt-4 text-xs text-center text-mybin-gray">
          <p>Need a code? Contact your site administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default CodeEntryForm;
