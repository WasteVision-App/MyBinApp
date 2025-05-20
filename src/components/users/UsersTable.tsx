
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: "super_admin" | "site_admin";
  company_id: string | null;
  company_name: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface UsersTableProps {
  users: User[];
  companies: Company[];
  loading: boolean;
  onRoleChange: (userId: string, newRole: "super_admin" | "site_admin") => void;
  onCompanyChange: (userId: string, companyId: string) => void;
  isSuperAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  companies,
  loading,
  onRoleChange,
  onCompanyChange,
  isSuperAdmin,
  onEdit,
  onDelete,
}) => {
  // Find Nuloop company
  const nuloopCompany = companies.find(company => company.name === "Nuloop");
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile view uses cards instead of a table
    return (
      <>
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No users found. Add your first user above.</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="mb-3">
                  <h3 className="font-medium truncate">{user.email}</h3>
                  <p className="text-sm text-gray-600">{user.full_name || "-"}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Role</label>
                    <Select
                      value={user.role}
                      onValueChange={(value: "super_admin" | "site_admin") => onRoleChange(user.id, value)}
                      disabled={!isSuperAdmin && user.role === "super_admin"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                        <SelectItem value="site_admin">Site Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Company</label>
                    <Select
                      value={user.company_id || "none"}
                      onValueChange={(value) => onCompanyChange(user.id, value)}
                      disabled={
                        user.role === "super_admin" || 
                        (user.role === "site_admin" && nuloopCompany && user.company_id === nuloopCompany.id)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No company" />
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
                    {user.role === "super_admin" && (
                      <p className="text-xs text-muted-foreground mt-1">Super Admins are assigned to Nuloop</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(user)}
                    >
                      <Pen className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(user)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  // Desktop view uses a table
  return (
    <>
      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No users found. Add your first user above.</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || "-"}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: "super_admin" | "site_admin") => onRoleChange(user.id, value)}
                      disabled={!isSuperAdmin && user.role === "super_admin"}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {isSuperAdmin && (
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        )}
                        <SelectItem value="site_admin">Site Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.company_id || "none"}
                      onValueChange={(value) => onCompanyChange(user.id, value)}
                      disabled={
                        user.role === "super_admin" || 
                        (user.role === "site_admin" && nuloopCompany && user.company_id === nuloopCompany.id)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="No company" />
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
                    {user.role === "super_admin" && (
                      <p className="text-xs text-muted-foreground mt-1">Super Admins are assigned to Nuloop</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(user)}
                      className="mr-2"
                    >
                      <Pen className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(user)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
};

export default UsersTable;
