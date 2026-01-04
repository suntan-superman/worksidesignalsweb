/**
 * @fileoverview Application information constants.
 * Centralized location for app name, version, and copyright information.
 * Update COPYRIGHT_YEAR here to update all copyright notices across the app.
 */

/**
 * Current copyright year - UPDATE THIS ANNUALLY
 */
export const COPYRIGHT_YEAR = 2026;

/**
 * Application information
 */
export const APP_INFO = {
  name: 'Workside Signals',
  companyName: 'Workside Software',
  companyLegalName: 'Workside Software LLC',
  version: '1.0.0',
  tagline: 'Real-Time Monitoring',
};

/**
 * Copyright text generators
 */
export const COPYRIGHT = {
  /** Short copyright: "© 2026 Workside Software" */
  short: `© ${COPYRIGHT_YEAR} ${APP_INFO.companyName}`,
  
  /** Full copyright: "© 2026 Workside Software. All rights reserved." */
  full: `© ${COPYRIGHT_YEAR} ${APP_INFO.companyName}. All rights reserved.`,
  
  /** Legal copyright: "© 2026 Workside Software LLC. All rights reserved." */
  legal: `© ${COPYRIGHT_YEAR} ${APP_INFO.companyLegalName}. All rights reserved.`,
  
  /** Copyright with company name as separate element (for JSX styling) */
  year: COPYRIGHT_YEAR,
  company: APP_INFO.companyName,
  companyLegal: APP_INFO.companyLegalName,
};

export default {
  COPYRIGHT_YEAR,
  APP_INFO,
  COPYRIGHT,
};
