
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFormSubmissionCheck = (formId: string | undefined) => {
  // Always set formHasBeenSubmitted to false to allow multiple submissions
  // regardless of access method (access code or form code)
  const [formHasBeenSubmitted, setFormHasBeenSubmitted] = useState(false);

  // We no longer need to check if the form has been submitted
  // This ensures users can always submit the form multiple times
  
  return { formHasBeenSubmitted: false };
};
