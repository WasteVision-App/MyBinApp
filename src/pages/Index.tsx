
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import AccessCodeForm from '@/components/AccessCodeForm';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [_, setFormData] = useLocalStorage('currentForm', null);

  useEffect(() => {
    // Redirect site admin to their dashboard
    if (user && !isSuperAdmin) {
      navigate('/site-admin');
    }
  }, [user, isSuperAdmin, navigate]);

  const navigateToAdmin = () => {
    if (isSuperAdmin) {
      navigate('/admin');
    } else {
      navigate('/site-admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mybin-light to-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-mybin-primary">MyBin.App</CardTitle>
          <CardDescription>Waste management reporting made simple</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AccessCodeForm />
          
          {user && (
            <Button
              onClick={navigateToAdmin}
              className="w-full bg-mybin-secondary hover:bg-mybin-secondary/80 mt-4"
            >
              Go to {isSuperAdmin ? 'Admin' : 'Site Admin'} Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Footer with Admin Login */}
      <div className="mt-8 text-center text-sm text-mybin-gray">
        <p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-mybin-primary"
            onClick={() => navigate('/auth')}
          >
            Admin Login
          </Button>
        </p>
      </div>
    </div>
  );
};

export default Index;
