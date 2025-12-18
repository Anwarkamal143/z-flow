type ICategory = {
  id: number
  name: string
  surrogate_key?: string
  updated_at?: Date | string
  created_at?: Date | string
  deleted_at?: Date | string
  is_active: boolean
  slug: string
  description?: string
  parentId?: number
  assetIds?: string[]
}
type IProduct = {
  updated_at?: Date | string
  created_at?: Date | string
  deleted_at?: Date | string
  id: string
  surrogate_key?: string
  name: string
  slug: string
  description?: string
  category_id?: number
  weight?: string
  height?: string
  width?: string
  length?: string
  is_featured?: boolean
  is_active: boolean
  published_at: Date | string
  metadata?: any
  image?: string
  category?: ICategory
}
type IProductVariant = {
  id: string
  productId: string
  name: string
  sku?: string
  code?: number
  slug: string
  price: string
  compareAtPrice?: string
  costPerItem?: string
  allowBackorder?: boolean
  isActive?: boolean
  metadata?: any
  createdAt?: Date | string
  updatedAt?: Date | string
}

type SizeRow = {
  id: string
  productVariantId: string
  sizeId: string
  name: string
  description?: string | null
  trackInventory: boolean
  quantityInStock: number
  sortOrder: number
}

type OptionRow = {
  id: string
  productId: string
  name: string
  values: string[]
}

type AttributeRow = {
  id: string
  productId: string
  attributeOptionId?: string | null
}

type ReviewRow = {
  id: string
  productId: string
  userId: string
  rating: number // 1..5
  title?: string | null
  comment?: string | null
  is_approved: boolean
  created_at: string
}
