
import { toast } from '@/components/ui/use-toast';
import { UserInfo, BinInspection, MissingBinReport, Json } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useSubmitForm = () => {
  const submitFormData = async (
    siteId: string,
    userInfo: UserInfo,
    inspections: BinInspection[],
    missingBinIds: any[],
    missingBinReports: MissingBinReport[],
    accessCode: string | undefined,
    timestamp: string
  ) => {
    if (!siteId || !userInfo) return { success: false };
    
    // We're now receiving already properly formatted missing bin reports and missing bin IDs
    // No need to reformat them here
    
    const submission = {
      siteId,
      userId: userInfo.name,
      userType: userInfo.userType,
      inspections,
      missingBinIds: missingBinIds.length > 0 ? missingBinIds : undefined,
      missingBinReports: missingBinReports.length > 0 ? missingBinReports : undefined,
      submittedAt: timestamp,
      accessCode
    };
    
    console.log('Submission:', submission);
    
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
