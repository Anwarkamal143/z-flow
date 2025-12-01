type CustomerState = {
  /**
   * The ID of the customer.
   */
  id: string;
  /**
   * Creation timestamp of the object.
   */
  createdAt: Date;
  /**
   * Last modification timestamp of the object.
   */
  modifiedAt: Date | null;
  metadata: { [k: string]: string | number | number | boolean };
  /**
   * The ID of the customer in your system. This must be unique within the organization. Once set, it can't be updated.
   */
  externalId: string | null;
  /**
   * The email address of the customer. This must be unique within the organization.
   */
  email: string;
  /**
   * Whether the customer email address is verified. The address is automatically verified when the customer accesses the customer portal using their email address.
   */
  emailVerified: boolean;
  /**
   * The name of the customer.
   */
  name: string | null;
  billingAddress: Address | null;
  taxId: Array<string | TaxIDFormat | null> | null;
  /**
   * The ID of the organization owning the customer.
   */
  organizationId: string;
  /**
   * Timestamp for when the customer was soft deleted.
   */
  deletedAt: Date | null;
  /**
   * The customer's active subscriptions.
   */
  activeSubscriptions: Array<CustomerStateSubscription>;
  /**
   * The customer's active benefit grants.
   */
  grantedBenefits: Array<CustomerStateBenefitGrant>;
  /**
   * The customer's active meters.
   */
  activeMeters: Array<CustomerStateMeter>;
  avatarUrl: string;
};
