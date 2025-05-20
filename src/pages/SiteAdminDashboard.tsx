
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const SiteAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [formCount, setFormCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch form count for this company
        const { count, error: formError } = await supabase
          .from('bin_tally_forms')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', user?.company_id);
        
        if (formError) throw formError;
        setFormCount(count || 0);
        
        // Fetch submission count for this company
        if (user?.company_id) {
          const { count: subCount, error: subError } = await supabase
            .from('form_submissions')
            .select('id', { count: 'exact', head: true })
            .eq('bin_tally_forms.company_id', user.company_id);
          
          if (subError) throw subError;
          setSubmissionCount(subCount || 0);
        }
        
        // Fetch company name
        if (user?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', user.company_id)
            .single();
          
          if (companyError) throw companyError;
          setCompanyName(companyData?.name || '');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user?.company_id) {
      fetchStats();
    }
  }, [user]);

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
