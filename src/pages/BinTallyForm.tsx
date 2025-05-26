import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { UserInfo } from '@/types';
import Navigation from '@/components/Navigation';
import SiteHeader from '@/components/SiteHeader';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import FormLoadingSkeleton from '@/components/FormLoadingSkeleton';
import BinTallyFormContent from '@/components/BinTallyFormContent';
import { useBinTallyFormData } from '@/hooks/useBinTallyFormData';
import { useBinInspections } from '@/hooks/useBinInspections';
import { useFormSubmission } from '@/hooks/useFormSubmission';

// Create a type for the currentForm to match useBinTallyFormData
type FormData = {
  access_code?: string;
  form_id?: string;
};

const BinTallyForm: React.FC = () => {
  const navigate = useNavigate();
  // Use the specific FormData type to avoid excessive type instantiation
  const [currentForm] = useLocalStorage<FormData>('currentForm', null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Custom hooks for managing form state and logic
  const { site, loading, formHasBeenSubmitted } = useBinTallyFormData(currentForm);
  
  const {
    inspections,
    missingBinIds,
    missingBinReports,
    selectedBin,
    showSubmissionConfirmation,
    setSelectedBin,
    setShowSubmissionConfirmation,
    handleSelectBin,
    handleInspectionSubmit,
    handleReportMissingBin,
    findMissingBinReport,
    allBinsAccountedFor
  } = useBinInspections(site);
  
  const {
    isSubmitted,
    submissionTimestamp,
    handleSubmitAllInspections,
    handleFinish
  } = useFormSubmission(
    site,
    userInfo,
    inspections,
    missingBinIds,
    missingBinReports,
    currentForm?.access_code
  );
  
  // Clear session storage when form is first loaded to start fresh
  useEffect(() => {
    // If form data is loaded, start fresh
    if (site) {
      // Keep user info while preserving navigation, but clear other inspection data
      sessionStorage.removeItem('savedInspections');
      sessionStorage.removeItem('savedMissingBinIds');
      sessionStorage.removeItem('savedMissingBinReports');
    }
    
    // Load saved user info from session storage if available
    const savedUserInfo = sessionStorage.getItem('savedUserInfo');
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo));
    }
  }, [site]);

  const handleUserInfoSubmit = (info: UserInfo) => {
    setUserInfo(info);
    sessionStorage.setItem('savedUserInfo', JSON.stringify(info));
  };

  const handleNavigateBack = () => {
    if (selectedBin) {
      setSelectedBin(null);
      return;
    }
    
    if (showSubmissionConfirmation) {
      // When going back from confirmation page, keep the inspection data
      setShowSubmissionConfirmation(false);
      return;
    }
    
    if (userInfo) {
      // Reset user info to go back to the user form
      setUserInfo(null);
      return;
    }
    
    // If we're at the first step, navigate home
    navigate('/');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('savedInspections');
    sessionStorage.removeItem('savedMissingBinIds');
    sessionStorage.removeItem('savedMissingBinReports');
    sessionStorage.removeItem('savedUserInfo');
    localStorage.removeItem('currentSite');
    localStorage.removeItem('currentForm');
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  if (loading) {
    return <FormLoadingSkeleton />;
  }

  if (!site) {
    return <div className="mybin-container p-4 text-center">Form data not found.</div>;
  }

  // Ensure this only returns a boolean
  const showBackNavigation = Boolean(selectedBin || showSubmissionConfirmation || userInfo);

  return (
    <div className="mybin-container py-4">
      <SiteHeader site={site} />
      <Navigation 
        onLogout={handleLogout} 
        showLogout={!!userInfo} 
        onBack={handleNavigateBack}
        showBack={showBackNavigation}
      />
      
      <BinTallyFormContent 
        site={site}
        userInfo={userInfo}
        isSubmitted={isSubmitted}
        showSubmissionConfirmation={showSubmissionConfirmation}
        selectedBin={selectedBin}
        inspections={inspections}
        missingBinIds={missingBinIds}
        missingBinReports={missingBinReports}
        allBinsAccountedFor={allBinsAccountedFor}
        findMissingBinReport={findMissingBinReport}
        onUserInfoSubmit={handleUserInfoSubmit}
        onSelectBin={handleSelectBin}
        onInspectionSubmit={handleInspectionSubmit}
        onReportMissingBin={handleReportMissingBin}
        onShowSubmissionConfirmation={() => setShowSubmissionConfirmation(!showSubmissionConfirmation)}
        onConfirmSubmit={handleSubmitAllInspections}
        onCancelInspection={() => setSelectedBin(null)}
        onFinish={handleFinish}
        submissionTimestamp={submissionTimestamp}
      />
    </div>
  );
};

export default BinTallyForm;
