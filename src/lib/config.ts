/**
 * Application Configuration
 * Centralized configuration management for environment variables
 * This allows for easy customization and white-labeling of the application
 */

export const config = {
  // Organization & Branding
  org: {
    name: process.env.NEXT_PUBLIC_ORG_NAME || "Arby Events",
    tagline:
      process.env.NEXT_PUBLIC_ORG_TAGLINE ||
      "Organize and manage events seamlessly",
    website: process.env.NEXT_PUBLIC_ORG_WEBSITE || "https://bakke.me",
  },

  // Application Identity
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Arby Events",
    brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Arby Events",
    title: process.env.NEXT_PUBLIC_APP_NAME || "Arby Events",
    description:
      process.env.NEXT_PUBLIC_ORG_TAGLINE ||
      "Professional event management platform for organizations and groups",
  },

  // Contact Information
  contact: {
    support: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bakke.me",
    admin: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@bakke.me",
    general: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@bakke.me",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  },

  // Copyright & Legal
  legal: {
    copyrightHolder:
      process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER || "Alexander Bakke",
    copyrightYear: process.env.NEXT_PUBLIC_COPYRIGHT_YEAR || "2025",
    currentYear: new Date().getFullYear(),
    privacyPolicyUrl: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || "/privacy",
    termsOfServiceUrl: process.env.NEXT_PUBLIC_TERMS_OF_SERVICE_URL || "/terms",
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || "noreply@bakke.me",
    fromName:
      process.env.EMAIL_FROM_NAME ||
      process.env.NEXT_PUBLIC_ORG_NAME ||
      "Arby Events",
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  },

  // Social Media Links
  social: {
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || "",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "",
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
  },

  // Application Settings
  app_settings: {
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "nb-NO",
    defaultTimezone: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Europe/Oslo",
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10"),
    apiRateLimit: parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || "60"),
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
    enableOAuth: process.env.NEXT_PUBLIC_ENABLE_OAUTH !== "false",
    enableEmailNotifications:
      process.env.NEXT_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS !== "false",
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
  },

  // URLs & Domains
  urls: {
    base:
      process.env.NEXT_PUBLIC_CUSTOM_DOMAIN ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000",
    vercel: process.env.VERCEL_URL || "",
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || "",
    hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || "",
  },

  // OAuth Providers
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    azure: {
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
    },
  },
} as const;

// Helper functions for common operations
export const getFullCopyrightText = () => {
  const startYear = config.legal.copyrightYear;
  const currentYear = config.legal.currentYear;
  const yearText =
    startYear === currentYear.toString()
      ? startYear
      : `${startYear}-${currentYear}`;
  return `© ${yearText} ${config.legal.copyrightHolder}. All rights reserved.`;
};

export const getAppTitle = (pageTitle?: string) => {
  if (pageTitle) {
    return `${pageTitle} | ${config.app.name}`;
  }
  return config.app.name;
};

export const getSupportEmailLink = () => {
  return `mailto:${config.contact.support}?subject=Support Request - ${config.app.name}`;
};

export const getContactEmailLink = () => {
  return `mailto:${config.contact.general}?subject=Inquiry - ${config.app.name}`;
};

// Type exports for TypeScript
export type ConfigType = typeof config;
export type OrgConfig = typeof config.org;
export type AppConfig = typeof config.app;
export type ContactConfig = typeof config.contact;
export type LegalConfig = typeof config.legal;

export default config;
