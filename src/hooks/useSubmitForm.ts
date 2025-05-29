
import { toast } from '@/components/ui/use-toast';
import { UserInfo, BinInspection, MissingBinReport, Json } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useSubmitForm = () => {
  const submitFormData = async (
    siteId: string,
    userInfo: UserInfo,
    inspections: BinInspection[],
    missingBinIds: any[], // Keep for compatibility but won't be used
    missingBinReports: MissingBinReport[], // Keep for compatibility but won't be used
    accessCode: string | undefined,
    timestamp: string
  ) => {
    if (!siteId || !userInfo) return { success: false };
    
    const submission = {
      siteId,
      userId: userInfo.name,
      userType: userInfo.userType,
      inspections, // Now contains all bins with proper flags
      submittedAt: timestamp,
      accessCode
    };
    
    console.log('Simplified submission data being saved:', submission);
    
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: siteId,
          submitted_by: userInfo.name,
          data: submission as unknown as Json
        });
        
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit the form. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return { submitFormData };
};
