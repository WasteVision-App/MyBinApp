
import { Site } from '@/types';

// Simple interfaces to avoid deep type instantiation
interface FormBin {
  id: string;
  quantity: number;
  bin_types: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    bin_size: string | null;
    bin_uom: string | null;
  };
}

interface FormResult {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  unique_code: string;
  company_id: string;
  area: string | null;
  companies: {
    id: string;
    name: string;
    address: string;
  } | null;
  form_bins: FormBin[];
}

export const transformFormDataToSite = (formData: FormResult): Site => {
  const siteData: Site = {
    id: formData.id,
    name: formData.title,
    code: formData.unique_code,
    area: formData.area || formData.location || 'N/A',
    address: formData.companies?.address || 'Address not available',
    bins: []
  };

  // Process the bin data
  if (formData.form_bins && Array.isArray(formData.form_bins)) {
    formData.form_bins.forEach((formBin) => {
      const quantity = formBin.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        const binSuffix = quantity > 1 ? ` #${i + 1}` : '';
        siteData.bins.push({
          id: formBin.bin_types.id,
          name: `${formBin.bin_types.name}${binSuffix}`,
          color: formBin.bin_types.color,
          icon: formBin.bin_types.icon || 'trash-2',
          bin_size: formBin.bin_types.bin_size || 'Unknown',
          bin_uom: formBin.bin_types.bin_uom || ''
        });
      }
    });
  }

  return siteData;
};
