import { AssetType } from "@/lib/enumTypes";

type IAsset = {
  id: string;
  name: string;
  type: string;
  resource_type: AssetType;
  url: string;
  thumbnail: string;
  size: number;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  surrogate_key: string;
  updated_at: Date;
  created_at: Date;
  deleted_at: Date | null;
  public_id: string;
};
