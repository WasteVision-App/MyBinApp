
import { useState, useEffect } from 'react';
import { supabase, setCurrentUserEmail } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSubmissions = () => {
  const { user, isSuperAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        console.log('Fetching submissions for user:', user);
        console.log('Is super admin:', isSuperAdmin);

        // Ensure user email is set in database session for RLS policies
        await setCurrentUserEmail(user.email);

        // Build base query to fetch submissions
        let query = supabase
          .from('form_submissions')
          .select(`
            id,
            form_id,
            submitted_by,
            submitted_at,
            data,
            bin_tally_forms (
              title,
              unique_code,
              company_id,
              companies (
                id,
                name
              )
            )
          `)
          .order('submitted_at', { ascending: false });

        console.log('Base query built');

        const { data, error } = await query;

        if (error) {
          console.error('Submissions fetch error:', error);
          throw error;
        }
        
        console.log('Raw submissions data:', data);
        
        // Filter and format the data
        let formattedData = (data || [])
          .filter((item: any) => {
            console.log('Processing submission item:', item);
            
            // Super admin can see all submissions
            if (isSuperAdmin) {
              console.log('Super admin - allowing all submissions');
              return item.bin_tally_forms !== null;
            }
            
            // For non-super admins, enforce company_id filtering
            const hasForm = item.bin_tally_forms !== null;
            const companyMatches = hasForm && 
                                 item.bin_tally_forms.company_id === user.company_id;
            
            console.log('Company filtering:', {
              hasForm,
              formCompanyId: item.bin_tally_forms?.company_id,
              userCompanyId: user.company_id,
              companyMatches
            });
            
            return hasForm && companyMatches;
          })
          .map((item: any) => ({
            id: item.id,
            form_id: item.form_id,
            submitted_by: item.submitted_by,
            submitted_at: item.submitted_at,
            data: item.data,
            form_title: item.bin_tally_forms?.title || 'Unknown',
            company_name: item.bin_tally_forms?.companies?.name || 'Unknown',
            unique_code: item.bin_tally_forms?.unique_code || 'Unknown'
          }));

        console.log('Formatted submissions:', formattedData);
        setSubmissions(formattedData);
        setFilteredSubmissions(formattedData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
        setFilteredSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, isSuperAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSubmissions(submissions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = submissions.filter(sub => 
        sub.form_title?.toLowerCase().includes(query) ||
        sub.company_name?.toLowerCase().includes(query) ||
        sub.submitted_by.toLowerCase().includes(query) ||
        sub.unique_code?.toLowerCase().includes(query)
      );
      setFilteredSubmissions(filtered);
    }
  }, [searchQuery, submissions]);

  return {
    submissions,
    filteredSubmissions,
    loading,
    searchQuery,
    setSearchQuery
  };
};
