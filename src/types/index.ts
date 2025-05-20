
// Types for the bin tallying application
export type UserType = 'Cleaner' | 'Waste Contractor' | 'Security' | 'Site Management' | 'Other';

export interface UserInfo {
  name: string;
  userType: UserType;
  rememberMe: boolean;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  area: string;
  address: string;
  bins: BinType[];
}

export interface BinType {
  id: string;
  name: string;
  color: string;
  icon: string;
  bin_size: string; // Now required
}

export interface BinInspection {
  binTypeId: string;
  binName: string;
  binSize: string; // Add bin size field
  fullness: number;
  contaminated: boolean;
  contaminationDetails?: string;
  timestamp: string;
}

export interface MissingBinReport {
  binId: string;
  binName?: string;
  comment: string;
}

export interface MissingBin {
  id: string;
  name: string;
}

export interface TallySubmission {
  siteId: string;
  userId: string;
  userType: UserType;
  inspections: BinInspection[];
  missingBinIds?: MissingBin[];
  missingBinReports?: MissingBinReport[];
  submittedAt: string;
  accessCode?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define basic form data interface
export interface FormData {
  access_code?: string;
  form_id?: string;
}
