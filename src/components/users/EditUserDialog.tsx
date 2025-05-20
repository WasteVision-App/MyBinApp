
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import type { User } from "@/hooks/useUsers";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: "super_admin" | "site_admin";
    company_id: string | null;
  };
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { companies, isSuperAdmin, handleUpdateRole, handleAssignCompany } = useUsers();
  const [loading, setLoading] = React.useState(false);

  // Find Nuloop company
  const nuloopCompany = companies.find(company => company.name === "Nuloop");
  
  const [fullName, setFullName] = React.useState(user?.full_name || "");
  const [role, setRole] = React.useState<"super_admin" | "site_admin">(user?.role || "site_admin");
  const [companyId, setCompanyId] = React.useState(user?.company_id || "none");

  React.useEffect(() => {
    setFullName(user?.full_name || "");
    setRole(user?.role || "site_admin");
    setCompanyId(user?.company_id || "none");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the user's name
      const { error: nameError } = await supabase
        .from("users")
        .update({ name: fullName })
        .eq("id", user.id);

      if (nameError) throw nameError;

      // Update role if changed
      if (role !== user.role) {
        await handleUpdateRole(user.id, role);
      }

      // Update company if changed
      if (companyId !== user.company_id) {
        await handleAssignCompany(user.id, companyId);
      }

      toast.success("User updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error updating user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="fullName">Full Name</FormLabel>
            <Input
              id="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="role">Role</FormLabel>
            <Select 
              value={role} 
              onValueChange={(value: "super_admin" | "site_admin") => setRole(value)}
              disabled={!isSuperAdmin && role === "super_admin"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {isSuperAdmin && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
                <SelectItem value="site_admin">Site Admin</SelectItem>
              </SelectContent>
            </Select>
            {!isSuperAdmin && role === "super_admin" && (
              <p className="text-xs text-red-500 mt-1">Only Super Admins can create other Super Admins</p>
            )}
          </div>
          <div className="space-y-2">
            <FormLabel htmlFor="company">Company</FormLabel>
            <Select 
              value={companyId} 
              onValueChange={setCompanyId}
              disabled={role === "super_admin"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign to company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {role === "super_admin" && (
              <p className="text-xs text-muted-foreground mt-1">Super Admins are automatically assigned to Nuloop</p>
            )}
          </div>
          <Button type="submit" className="mt-4" disabled={loading}>
            {loading ? "Saving..." : "Save User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
