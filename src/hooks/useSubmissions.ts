
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSubmissions = () => {
  const { user, isSuperAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      try {
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

        // Filter by company if not a super admin
        if (!isSuperAdmin && user.company_id) {
          // Important: Filter by company_id in the bin_tally_forms table
          query = query.eq('bin_tally_forms.company_id', user.company_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        // Filter out null bin_tally_forms entries and ensure company matches
        let formattedData = data
          .filter((item: any) => {
            // Super admin can see all submissions
            if (isSuperAdmin) return true;
            
            // For non-super admins, enforce company_id filtering
            // Ensure that bin_tally_forms exists and the company_id matches the user's company_id
            return item.bin_tally_forms && 
                   item.bin_tally_forms.company_id === user.company_id;
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

        setSubmissions(formattedData);
        setFilteredSubmissions(formattedData);
      } catch (error) {
        console.error('Error fetching submissions:', error);
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
