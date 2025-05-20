import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import AddCompanyDialog from "@/components/companies/AddCompanyDialog";
import { useNavigate } from "react-router-dom";
import { FileText, Search } from "lucide-react";

interface Company {
  id: string;
  name: string;
  address: string | null;
  abn: string | null;
  created_at: string;
  formCount?: number;
}

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editABN, setEditABN] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Get the list of companies
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      // For each company, get a count of its forms
      if (data) {
        const companiesWithFormCount = await Promise.all(
          data.map(async (company) => {
            const { count, error: formError } = await supabase
              .from("bin_tally_forms")
              .select("id", { count: 'exact', head: true })
              .eq("company_id", company.id);
              
            if (formError) {
              console.error("Error fetching form count:", formError);
              return { ...company, formCount: 0 };
            }
            
            return {
              ...company,
              formCount: count || 0,
            };
          })
        );
        
        setCompanies(companiesWithFormCount);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching companies",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingId) return;

    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: editName.trim(),
          address: editAddress.trim() || null,
          abn: editABN.trim() || null,
        })
        .eq("id", editingId);
      if (error) throw error;

      setEditingId(null);
      toast({
        title: "Company updated",
        description: `Company has been updated successfully.`,
      });

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error updating company",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (name === "Nuloop" && isSuperAdmin) {
      toast({
        title: "Cannot delete Nuloop",
        description:
          "The Nuloop company cannot be deleted as it is reserved for super admins.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Company deleted",
        description: `${name} has been deleted successfully.`,
      });

      fetchCompanies();
    } catch (error: any) {
      toast({
        title: "Error deleting company",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (company: Company) => {
    if (company.name === "Nuloop" && !isSuperAdmin) {
      toast({
        title: "Cannot edit Nuloop",
        description: "The Nuloop company can only be edited by super admins.",
        variant: "destructive",
      });
      return;
    }
    setEditingId(company.id);
    setEditName(company.name);
    setEditAddress(company.address || "");
    setEditABN(company.abn || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const viewCompanyForms = (companyId: string) => {
    navigate(`/site-admin/bin-tally-forms?company=${companyId}`);
  };
  
  const filteredCompanies = searchQuery.trim() === "" 
    ? companies 
    : companies.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (company.address && company.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (company.abn && company.abn.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies Management</h1>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          Add New Company
        </Button>
      </div>

      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search companies by name, address, or ABN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>

      <AddCompanyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCompanyAdded={fetchCompanies}
      />

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading companies...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No companies found. Add your first company above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>ABN</TableHead>
                  <TableHead>Forms</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">
                      {editingId === company.id ? (
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                          autoFocus
                          required
                        />
                      ) : (
                        company.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === company.id ? (
                        <input
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        company.address || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === company.id ? (
                        <input
                          value={editABN}
                          onChange={(e) => setEditABN(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        company.abn || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{company.formCount || 0}</span>
                        {company.formCount && company.formCount > 0 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewCompanyForms(company.id)}
                            className="text-mybin-primary h-6 p-1"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {editingId === company.id ? (
                        <form
                          onSubmit={handleUpdateCompany}
                          className="flex gap-2 justify-end"
                        >
                          <Button type="submit" size="sm">
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                        </form>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(company)}
                            className="mr-2"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteCompany(company.id, company.name)
                            }
                            className="text-red-500 hover:text-red-700"
                            disabled={company.name === "Nuloop" && isSuperAdmin}
                          >
                            Delete
                          </Button>
                        </>
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

export default Companies;
