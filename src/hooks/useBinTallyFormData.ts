
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Site, FormData } from '@/types';
import { useFetchFormData } from './useFetchFormData';
import { useFormSubmissionCheck } from './useFormSubmissionCheck';
import { transformFormDataToSite } from '@/utils/formDataTransformer';

export const useBinTallyFormData = (currentForm: FormData | null) => {
  const navigate = useNavigate();
  const [site, setSite] = useState<Site | null>(null);
  const { fetchFormData, loading, setLoading } = useFetchFormData(currentForm);
  const { formHasBeenSubmitted } = useFormSubmissionCheck(site?.id);

  useEffect(() => {
    console.log('BinTallyForm mount - checking for form data');
    
    if (!currentForm) {
      console.log('No form data found in currentForm state, redirecting to home');
      toast({
        title: "Access Required",
        description: "Please enter an access code on the home page to continue.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    const loadFormData = async () => {
      setLoading(true);
      
      // Always fetch fresh data from the server
      console.log('Fetching fresh form data from server...');
      const formData = await fetchFormData();
      
      if (formData) {
        const siteData = transformFormDataToSite(formData);
        console.log('Fetched and transformed site data:', siteData);
        setSite(siteData);
        
        // Store in localStorage but we'll still fetch fresh data on every load
        localStorage.setItem('currentSite', JSON.stringify(siteData));
      } else {
        console.log('Failed to fetch form data');
      }
      
      setLoading(false);
    };

    loadFormData();
  }, [navigate, currentForm, fetchFormData, setLoading]);

  return { site, loading, formHasBeenSubmitted };
};
