
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const [companyCount, setCompanyCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch company count
        const { count: companyCount, error: companyError } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
        
        if (companyError) throw companyError;
        setCompanyCount(companyCount || 0);
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        setUserCount(userCount || 0);
        
        // Fetch submissions count
        const { count: submissionCount, error: submissionError } = await supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true });
        
        if (submissionError) throw submissionError;
        setSubmissionCount(submissionCount || 0);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (isSuperAdmin) {
      fetchStats();
    }
  }, [isSuperAdmin]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mybin-dark">Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-mybin-primary">{companyCount}</CardTitle>
            <CardDescription>Companies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="link" 
              onClick={() => navigate('/admin/companies')} 
              className="p-0 h-auto text-xs text-mybin-primary"
            >
              Manage Companies →
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-mybin-primary">{userCount}</CardTitle>
            <CardDescription>Users</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="link" 
              onClick={() => navigate('/admin/users')} 
              className="p-0 h-auto text-xs text-mybin-primary"
            >
              Manage Users →
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
              onClick={() => navigate('/admin/submissions')} 
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

export default AdminDashboard;
