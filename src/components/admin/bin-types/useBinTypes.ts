
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { BinType, BinTypeFormData } from "@/types/binTypes";

export const useBinTypes = () => {
  const [binTypes, setBinTypes] = useState<BinType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBinTypes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bin_types")
      .select("id, name, color, icon, bin_size, bin_uom, created_at, updated_at")
      .order("name");
    
    if (error) {
      toast({ title: "Error fetching bin types", description: error.message, variant: "destructive" });
    } else {
      // Map the database results to our BinType interface
      const mappedData: BinType[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        color: item.color || undefined,
        icon: item.icon || undefined,
        bin_size: item.bin_size || undefined,
        bin_uom: item.bin_uom || undefined,
      }));
      setBinTypes(mappedData);
    }
    setLoading(false);
  };

  const createBinType = async (formData: BinTypeFormData) => {
    const { error } = await supabase.from("bin_types").insert([{
      name: formData.name.trim(),
      color: formData.color.trim() || null,
      icon: formData.icon.trim() || null,
      bin_size: formData.binSize.trim(),
      bin_uom: formData.binUOM.trim(),
    }]);
    
    if (error) throw error;
    
    toast({ title: "Created", description: "Bin type created successfully." });
    fetchBinTypes();
  };

  const updateBinType = async (id: string, formData: BinTypeFormData) => {
    const { error } = await supabase.from("bin_types").update({
      name: formData.name.trim(),
      color: formData.color.trim() || null,
      icon: formData.icon.trim() || null,
      bin_size: formData.binSize.trim(),
      bin_uom: formData.binUOM.trim(),
    }).eq("id", id);
    
    if (error) throw error;
    
    toast({ title: "Updated", description: "Bin type updated successfully." });
    fetchBinTypes();
  };

  const deleteBinType = async (id: string) => {
    const { error } = await supabase.from("bin_types").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Bin type deleted." });
      setBinTypes(binTypes.filter((b) => b.id !== id));
    }
  };

  const checkDuplicate = async (formData: BinTypeFormData, editingId?: string): Promise<boolean> => {
    try {
      const { data: existingBins, error: checkError } = await supabase
        .from("bin_types")
        .select("id")
        .eq("name", formData.name.trim())
        .eq("bin_size", formData.binSize.trim())
        .eq("bin_uom", formData.binUOM.trim());
      
      if (checkError) throw checkError;
      
      const duplicateExists = existingBins && existingBins.length > 0;
      
      if (duplicateExists && editingId) {
        // Check if any of the found bins have a different ID than the one being edited
        return existingBins.some((bin) => bin.id !== editingId);
      }
      
      return duplicateExists || false;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchBinTypes();
  }, []);

  return {
    binTypes,
    loading,
    fetchBinTypes,
    createBinType,
    updateBinType,
    deleteBinType,
    checkDuplicate,
  };
};
