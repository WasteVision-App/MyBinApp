
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';

interface NavigationProps {
  onLogout: () => void;
  onBack?: () => void;
  showLogout?: boolean;
  showBack?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ 
  onLogout, 
  onBack, 
  showLogout = true,
  showBack = true 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex justify-between items-center mb-4">
      {showBack && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleBack}
          className="text-mybin-gray hover:text-mybin-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      {!showBack && <div />}

      {showLogout && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onLogout}
          className="text-mybin-gray hover:text-mybin-primary flex items-center space-x-1"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span>Logout</span>
        </Button>
      )}
    </div>
  );
};

export default Navigation;
