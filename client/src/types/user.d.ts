import { Role } from "@/lib/enumTypes";

type IUser = {
  id: string;
  status: UserStatus | null;
  email: string;
  name: string | null;
  phone: string | null;
  password: string | null;
  image: string | null;
  email_verified: Date | null;
  isActive: boolean | null;
  role: Role | null;
  last_login: Date | null;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
};

type IAccount = {
  id: string;
  surrogate_key: string;
  userId: number;
  is_active: boolean;
  updated_at: Date;
  created_at: Date;
  deleted_at: Date | null;
  type: AccountType;
  provider: string;
  provider_account_id: string | null;
  expires_at: number | null;
  token_type: string | null;
};
type IAccount = {
  id: string;
  surrogate_key: string;
  userId: string;
  isActive: boolean | null;
  updatedAt: Date;
  createdAt: Date;
  deletedAt: Date | null;
  type: AccountType;
  provider: string;
  provider_account_id: string | null;
  expires_at: number | null;
  token_type: string | null;
};

type IAppUser = IUser & {
  accounts: IAccount[];
};
