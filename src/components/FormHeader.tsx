
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FormHeaderProps {
  isEditing: boolean;
}

const FormHeader: React.FC<FormHeaderProps> = ({ isEditing }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        {isEditing ? 'Edit Bin Tally Form' : 'Create Bin Tally Form'}
      </h1>
      {isEditing && (
        <Button 
          onClick={() => navigate('/site-admin/bin-tally-forms/new')} 
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Form
        </Button>
      )}
    </div>
  );
};

export default FormHeader;
