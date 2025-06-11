import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, setCurrentUserEmail } from '@/integrations/supabase/client';

const SiteAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [formCount, setFormCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching stats for user:', user);
        
        if (!user?.company_id || !user?.email) {
          console.log('No company_id or email found for user');
          setLoading(false);
          return;
        }

        // Ensure user email is set in database session for RLS policies
        await setCurrentUserEmail(user.email);

        // Fetch company name first
        console.log('Fetching company with ID:', user.company_id);
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', user.company_id)
          .maybeSingle();
        
        if (companyError) {
          console.error('Company fetch error:', companyError);
          throw companyError;
        }
        
        console.log('Company data:', companyData);
        setCompanyName(companyData?.name || 'Unknown Company');
        
        // Fetch form count for this company
        console.log('Fetching form count for company:', user.company_id);
        const { count: formCountResult, error: formError } = await supabase
          .from('bin_tally_forms')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', user.company_id);
        
        if (formError) {
          console.error('Form count error:', formError);
          throw formError;
        }
        
        console.log('Form count:', formCountResult);
        setFormCount(formCountResult || 0);
        
        // Fetch submission count for this company by first getting the form IDs
        console.log('Fetching forms for submission count...');
        const { data: forms, error: formsError } = await supabase
          .from('bin_tally_forms')
          .select('id')
          .eq('company_id', user.company_id);
        
        if (formsError) {
          console.error('Forms fetch error:', formsError);
          throw formsError;
        }
        
        console.log('Forms for submission count:', forms);
        
        if (forms && forms.length > 0) {
          const formIds = forms.map(form => form.id);
          
          // Then count submissions for these forms
          console.log('Fetching submission count for form IDs:', formIds);
          const { count: subCount, error: subError } = await supabase
            .from('form_submissions')
            .select('id', { count: 'exact', head: true })
            .in('form_id', formIds);
          
          if (subError) {
            console.error('Submission count error:', subError);
            throw subError;
          }
          
          console.log('Submission count:', subCount);
          setSubmissionCount(subCount || 0);
        } else {
          setSubmissionCount(0);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.company_id && user?.email) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-red-600">No company assigned to your account.</p>
          <p className="text-sm text-gray-600">Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mybin-dark">Site Admin Dashboard</h1>
          <p className="text-mybin-gray">Managing waste collection for {companyName}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-mybin-primary">{formCount}</CardTitle>
            <CardDescription>Bin Tally Forms</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="link" 
              onClick={() => navigate('/site-admin/bin-tally-forms')} 
              className="p-0 h-auto text-xs text-mybin-primary"
            >
              Manage Forms →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-mybin-primary">Create New</CardTitle>
            <CardDescription>Start a New Bin Tally Form</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="link" 
              onClick={() => navigate('/site-admin/bin-tally-forms/new')} 
              className="p-0 h-auto text-xs text-mybin-primary"
            >
              Create Form →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-mybin-primary">{submissionCount}</CardTitle>
            <CardDescription>Form Submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="link" 
              onClick={() => navigate('/site-admin/submissions')} 
              className="p-0 h-auto text-xs text-mybin-primary"
            >
              View Submissions →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SiteAdminDashboard;
