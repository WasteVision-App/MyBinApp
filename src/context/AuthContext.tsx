
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, setCurrentUserEmail } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { hashPassword } from '@/utils/hash';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  company_id: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('mybinapp_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsSuperAdmin(parsedUser.role === 'super_admin');
        
        // Set the user email in database session for RLS policies
        await setCurrentUserEmail(parsedUser.email);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const hashedPassword = await hashPassword(password);
      console.log('Attempting login with:', { email, hashedPassword });

      // Get user from the users table with the provided email
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, password_hash, role, company_id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        throw new Error('Login failed: Database error');
      }

      if (!data) {
        console.error('No user found with email:', email);
        throw new Error('Login failed: Invalid credentials');
      }

      console.log('User found:', data);
      console.log('Comparing passwords:', { 
        stored: data.password_hash, 
        provided: hashedPassword 
      });

      if (data.password_hash !== hashedPassword) {
        console.error('Password mismatch');
        throw new Error('Login failed: Invalid credentials');
      }

      // Fix for role format: normalize the role string to ensure consistency
      const normalizedRole = data.role.replace(' ', '_').toLowerCase();

      const userData: User = {
        id: data.id,
        email: data.email,
        full_name: data.name, // Map name to full_name for consistency
        role: normalizedRole,
        company_id: data.company_id,
      };

      setUser(userData);
      setIsSuperAdmin(normalizedRole === 'super_admin');
      localStorage.setItem('mybinapp_user', JSON.stringify(userData));

      // Set the user email in database session for RLS policies
      await setCurrentUserEmail(userData.email);

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setIsSuperAdmin(false);
      localStorage.removeItem('mybinapp_user');
      
      // Clear the user email from database session
      await setCurrentUserEmail(null);
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isLoading, 
      signIn,
      signOut, 
      isSuperAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
