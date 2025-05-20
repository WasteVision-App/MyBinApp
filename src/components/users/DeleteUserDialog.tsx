
import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name?: string | null;
  };
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleDeleteUser = async () => {
    if (!user.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast.success("User deleted successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Error deleting user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{user.email}</span>? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteUser} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
