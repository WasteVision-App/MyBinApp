
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import UsersTable from "@/components/users/UsersTable";
import EditUserDialog from "@/components/users/EditUserDialog";
import DeleteUserDialog from "@/components/users/DeleteUserDialog";
import AddUserForm from "@/components/users/AddUserForm";

export interface UserToEdit {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "site_admin";
  company_id: string | null;
  created_at?: string;
  company_name?: string | null;
}

const UsersPage: React.FC = () => {
  const {
    users,
    companies,
    loadingUsers,
    handleUpdateRole,
    handleAssignCompany,
    isSuperAdmin,
  } = useUsers();

  const [userToEdit, setUserToEdit] = useState<UserToEdit | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserToEdit | null>(null);

  const handleEditUser = (user: UserToEdit) => {
    setUserToEdit(user);
  };

  const handleDeleteUser = (user: UserToEdit) => {
    setUserToDelete(user);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
      </div>

      {isSuperAdmin && <AddUserForm />}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            companies={companies}
            loading={loadingUsers}
            onRoleChange={handleUpdateRole}
            onCompanyChange={handleAssignCompany}
            isSuperAdmin={isSuperAdmin}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {userToEdit && (
        <EditUserDialog
          user={userToEdit}
          open={!!userToEdit}
          onOpenChange={(open) => !open && setUserToEdit(null)}
        />
      )}

      {/* Delete User Dialog */}
      {userToDelete && (
        <DeleteUserDialog
          user={userToDelete}
          open={!!userToDelete}
          onOpenChange={(open) => !open && setUserToDelete(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
