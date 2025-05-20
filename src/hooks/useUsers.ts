
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { hashPassword } from "@/utils/hash";
import { useAuth } from "@/context/AuthContext";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "site_admin";
  company_id: string | null;
  company_name: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
}

export function useUsers() {
  const { isSuperAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [role, setRole] = useState<"super_admin" | "site_admin">("site_admin");
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select(`
          id,
          email,
          name,
          role,
          company_id,
          created_at
        `)
        .order("email");

      if (usersError) throw usersError;

      if (usersData) {
        const usersWithCompanyNames: User[] = await Promise.all(
          usersData.map(async (user) => {
            let companyName: string | null = null;
            if (user.company_id) {
              const { data: companyData } = await supabase
                .from("companies")
                .select("name")
                .eq("id", user.company_id)
                .single();
              companyName = companyData?.name || null;
            }
            return {
              ...user,
              full_name: user.name,
              company_name: companyName,
              role: user.role as "super_admin" | "site_admin",
            };
          })
        );
        setUsers(usersWithCompanyNames);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .order("name");
      if (error) throw error;
      if (!isSuperAdmin) {
        const filtered = data?.filter((c) => c.name !== "Nuloop") || [];
        setCompanies(filtered);
      } else {
        setCompanies(data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching companies",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [fetchUsers, fetchCompanies]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Super admin checks
    if (role === "super_admin") {
      const nuloopCompany = companies.find((c) => c.name === "Nuloop");
      if (nuloopCompany && selectedCompany !== nuloopCompany.id) {
        toast({
          title: "Invalid Assignment",
          description: "Super Admin users must be assigned to Nuloop company.",
          variant: "destructive",
        });
        return;
      }
      if (!isSuperAdmin) {
        toast({
          title: "Permission Denied",
          description: "Only Super Admins can create other Super Admin users.",
          variant: "destructive",
        });
        return;
      }
    }
    // Site admin to Nuloop check
    if (role === "site_admin") {
      const nuloopCompany = companies.find((c) => c.name === "Nuloop");
      if (nuloopCompany && selectedCompany === nuloopCompany.id) {
        toast({
          title: "Invalid Assignment",
          description: "Site Admin users cannot be assigned to Nuloop company.",
          variant: "destructive",
        });
        return;
      }
    }

    setCreatingUser(true);
    try {
      // Handle the async hashPassword function properly
      const hashedPassword = await hashPassword(password);

      const { error: userError } = await supabase
        .from("users")
        .insert({
          email: email,
          name: fullName || null,
          password_hash: hashedPassword,
          role: role,
          company_id: selectedCompany === "none" ? null : selectedCompany || null,
        })
        .select();

      if (userError) throw userError;

      setEmail("");
      setPassword("");
      setFullName("");
      setSelectedCompany("");
      setRole("site_admin");

      toast({
        title: "User created",
        description: `${email} has been added successfully.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "super_admin" | "site_admin") => {
    try {
      if (newRole === "super_admin") {
        if (!isSuperAdmin) {
          toast({
            title: "Permission Denied",
            description: "Only Super Admins can assign Super Admin role.",
            variant: "destructive",
          });
          return;
        }
        const { data: userData } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", userId)
          .single();

        const { data: nuloopData } = await supabase
          .from("companies")
          .select("id")
          .eq("name", "Nuloop")
          .single();

        if (nuloopData && userData?.company_id !== nuloopData.id) {
          await supabase
            .from("users")
            .update({
              role: newRole,
              company_id: nuloopData.id,
            })
            .eq("id", userId);
        } else {
          await supabase
            .from("users")
            .update({ role: newRole })
            .eq("id", userId);
        }
      } else {
        // Downgrading to site_admin
        const { data: userData } = await supabase
          .from("users")
          .select("company_id")
          .eq("id", userId)
          .single();

        const { data: nuloopData } = await supabase
          .from("companies")
          .select("id")
          .eq("name", "Nuloop")
          .single();

        if (nuloopData && userData?.company_id === nuloopData.id) {
          await supabase
            .from("users")
            .update({
              role: newRole,
              company_id: null,
            })
            .eq("id", userId);
        } else {
          await supabase
            .from("users")
            .update({ role: newRole })
            .eq("id", userId);
        }
      }

      toast({
        title: "Role updated",
        description: `User role updated to ${newRole}.`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAssignCompany = async (userId: string, companyId: string) => {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      // If companyId is "none", set to null
      const effectiveCompanyId = companyId === "none" ? null : companyId;
      
      // Only check company name if there's a real company ID
      if (effectiveCompanyId) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("name")
          .eq("id", effectiveCompanyId)
          .single();

        if (userData?.role === "site_admin" && companyData?.name === "Nuloop") {
          toast({
            title: "Invalid Assignment",
            description: "Site Admin users cannot be assigned to Nuloop company.",
            variant: "destructive",
          });
          return;
        }

        if (
          userData?.role === "super_admin" &&
          companyData?.name !== "Nuloop"
        ) {
          toast({
            title: "Invalid Assignment",
            description: "Super Admin users must be assigned to Nuloop company.",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("users")
        .update({ company_id: effectiveCompanyId })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Company assignment updated",
        description: "User company assignment has been updated.",
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error updating company assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    users,
    companies,
    loadingUsers,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    selectedCompany,
    setSelectedCompany,
    role,
    setRole,
    handleCreateUser,
    creatingUser,
    handleUpdateRole,
    handleAssignCompany,
    isSuperAdmin,
  };
}
