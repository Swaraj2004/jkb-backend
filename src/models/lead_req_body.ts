export interface LeadReqBody {
  name: string;
  email?: string;
  phone?: string;
  /** Handle/username on the platform (e.g. @aum.dev on Instagram, profile URL slug, etc.) */
  socialUsername?: string;
  /** Platform or channel, e.g. instagram, facebook, linkedin, youtube, website, referral */
  source?: string;
  message?: string;
}
