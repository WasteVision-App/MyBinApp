
export const useSessionStorage = () => {
  const clearFormData = () => {
    // Clear all session storage data after successful submission
    sessionStorage.removeItem('savedInspections');
    sessionStorage.removeItem('savedMissingBinIds');
    sessionStorage.removeItem('savedMissingBinReports');
    sessionStorage.removeItem('savedUserInfo');
  };

  const clearAllData = () => {
    // Clear all session storage data and local storage
    clearFormData();
    localStorage.removeItem('currentSite');
    localStorage.removeItem('currentForm');
  };

  return {
    clearFormData,
    clearAllData
  };
};
