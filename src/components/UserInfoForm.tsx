
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserInfo, UserType } from '@/types';

interface UserInfoFormProps {
  onSubmit: (userInfo: UserInfo) => void;
}

const userTypes: UserType[] = [
  'Cleaner',
  'Waste Contractor', 
  'Security', 
  'Site Management',
  'Other'
];

const UserInfoForm: React.FC<UserInfoFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('Cleaner');

  // Load saved user info from session storage if available
  useEffect(() => {
    const savedUserInfo = sessionStorage.getItem('savedUserInfo');
    if (savedUserInfo) {
      const userInfo = JSON.parse(savedUserInfo);
      setName(userInfo.name);
      setUserType(userInfo.userType);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userInfo: UserInfo = {
      name,
      userType,
      rememberMe: false // Set to false as we're removing the feature
    };
    
    // Save to session storage before submitting
    sessionStorage.setItem('savedUserInfo', JSON.stringify(userInfo));
    onSubmit(userInfo);
  };

  return (
    <div className="mybin-card">
      <h2 className="mybin-title">Who are you?</h2>
      <p className="text-mybin-gray mb-4">Tell us a bit about yourself to continue</p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="name" className="mybin-label">Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mybin-input"
            placeholder="Enter your name"
            required
          />
        </div>
        
        <div className="mb-6">
          <Label className="mybin-label mb-2">User Type</Label>
          <RadioGroup 
            value={userType} 
            onValueChange={(value) => setUserType(value as UserType)}
            className="space-y-2"
          >
            {userTypes.map((type) => (
              <div 
                key={type} 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50"
              >
                <RadioGroupItem value={type} id={`type-${type}`} />
                <Label htmlFor={`type-${type}`} className="cursor-pointer flex-grow">
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <Button type="submit" className="mybin-btn-primary w-full">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default UserInfoForm;
