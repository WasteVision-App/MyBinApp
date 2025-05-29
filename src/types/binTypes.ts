
export interface BinType {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  bin_size?: string;
  bin_uom?: string;
}

export interface BinTypeFormData {
  name: string;
  color: string;
  icon: string;
  binSize: string;
  binUOM: string;
}
