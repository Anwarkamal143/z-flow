export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  GUEST = 'guest',
  SUPER_ADMIN = 'super_admin',
}
export type IRole = `${Role}`
export enum Provider {
  email = 'email',
  google = 'google',
  github = 'github',
  linkedIn = 'linkedIn',
}
export type IProviderType = `${Provider}`
export enum AccountType {
  oauth = 'oauth',
  email = 'email',
}
export type IAccountType = `${AccountType}`
export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
export type IAccountStatus = `${AccountStatus}`

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}
export type IPaymentStatus = `${PaymentStatus}`
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export type IPaymentMethod = `${PaymentMethod}`
export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}
export type IAssetType = `${AssetType}`

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}
export type IUserStatus = `${UserStatus}`
export enum ProductVisiblity {
  PUBLIC = 'public',
  PRIVATE = 'private',
  ARCHIVED = 'archived',
}
export type IProductVisiblity = `${ProductVisiblity}`
export enum UserAddressType {
  BILLING = 'billing',
}
export type IUserAddressType = `${UserAddressType}`
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
export type IDiscountType = `${DiscountType}`
export enum NodeType {
  INITIAL = 'initial',
  MANUAL_TRIGGER = 'manual_trigger',
  HTTP_REQUEST = 'http_request',
  GOOGLE_FORM_TRIGGER = 'google_form_trigger',
}
export type INodeType = `${NodeType}`
