import { UserStatus } from '@/config/enums'
import { Role } from '@/lib/enumTypes'

type IUser = {
  id: string
  name: string | null
  email: string
  password: string | null
  phone: string | null
  image: string | null
  email_verified: Date | null
  polar_customer_id: string | null
  is_active: boolean | null
  role: Role | null
  status: UserStatus | null
  last_login: Date | null
  updated_at: Date
  created_at: Date
  deleted_at: Date | null
}

type IAccount = {
  id: string
  surrogate_key: string
  userId: number
  is_active: boolean
  updated_at: Date
  created_at: Date
  deleted_at: Date | null
  type: AccountType
  provider: string
  provider_account_id: string | null
  expires_at: number | null
  token_type: string | null
}

type IAppUser = IUser & {
  accounts: IAccount[]
}
