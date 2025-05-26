import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Mail, Trash, Plus, Power } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  access_code: string;
  is_used: boolean;
  created_at: string;
  expires_at: string | null;
  status: string;
  last_updated_at: string;
}

interface FormDetails {
  id: string;
  title: string;
  unique_code: string;
}

const FormInvitations: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    fetchFormDetails();
    fetchInvitations();
  }, [id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bin_tally_forms')
        .select('id, title, unique_code')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setFormDetails(data);
    } catch (error: any) {
      toast({
        title: "Error fetching form details",
        description: error.message,
        variant: "destructive",
      });
      navigate('/site-admin/bin-tally-forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('form_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInvitations(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching invitations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (invitationId: string, currentStatus: string, email: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: newStatus })
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Invitation for ${email} is now ${newStatus}.`,
      });
      
      setInvitations(invitations.map(inv => 
        inv.id === invitationId ? { ...inv, status: newStatus } : inv
      ));
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendInvitationEmail = async (invitation: Invitation) => {
    try {
      setSendingEmail(invitation.id);
      console.log('Sending invitation email for:', invitation.email);
      
      if (!formDetails) {
        toast({
          title: "Error",
          description: "Form details not loaded. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('send-invitation-email', {
        body: { 
          email: invitation.email,
          accessCode: invitation.access_code,
          formTitle: formDetails.title
        }
      });

      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }

      toast({
        title: "Email Sent",
        description: `Invitation email sent to ${invitation.email}`,
      });
    } catch (error: any) {
      console.error('Error in sendInvitationEmail:', error);
      toast({
        title: "Error sending email",
        description: error.message || "Failed to send email. Please check console logs for details.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !formDetails) return;
    
    setIsCreating(true);
    
    try {
      const accessCode = await generateAccessCode();
      
      const { error } = await supabase
        .from('invitations')
        .insert({
          form_id: id,
          email: email.trim().toLowerCase(),
          access_code: accessCode,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Invitation Created",
        description: `An invitation has been created for ${email}.`,
      });
      
      setEmail('');
      fetchInvitations();
    } catch (error: any) {
      toast({
        title: "Error creating invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteInvitation = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete the invitation for ${email}?`)) return;
    
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Invitation Deleted",
        description: `Invitation for ${email} has been deleted.`,
      });
      
      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting invitation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateAccessCode = async (): Promise<string> => {
    try {
      // Try to use the new alpha-only edge function
      const { data, error } = await supabase.functions.invoke('generate-alpha-code', {
        body: { length: 8 }
      });
      
      if (error) {
        console.error('Error calling generate-alpha-code function:', error);
        // Fallback to client-side generation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
      
      if (data?.code) {
        return data.code;
      } else {
        // Fallback to client-side generation
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      }
    } catch (error) {
      console.error('Error generating code:', error);
      // Fallback to client-side generation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
  };

  if (loading && !formDetails) {
    return (
      <div className="text-center py-8">
        Loading form details...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invitations</h1>
          <p className="text-mybin-gray">
            For: {formDetails?.title} - Code: <code className="bg-gray-100 px-2 py-1 rounded">{formDetails?.unique_code}</code>
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => navigate('/site-admin/bin-tally-forms')}
        >
          Back to Forms
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {!isSuperAdmin && (
            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isCreating}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isCreating ? 'Adding...' : 'Add Invitation'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading invitations...</div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No invitations found. Add an email address above to invite someone.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {invitation.access_code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        invitation.status === 'active' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {invitation.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(invitation.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invitation.last_updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {!isSuperAdmin && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendInvitationEmail(invitation)}
                            disabled={sendingEmail === invitation.id}
                            className="mr-1"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            {sendingEmail === invitation.id ? 'Sending...' : 'Send Email'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusToggle(invitation.id, invitation.status, invitation.email)}
                            className={invitation.status === 'active' ? 'text-red-500' : 'text-green-500'}
                          >
                            <Power className="w-4 h-4 mr-1" />
                            {invitation.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                            className="text-red-500"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormInvitations;
