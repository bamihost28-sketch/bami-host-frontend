export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'financial' | 'business' | 'management' | 'system' | 'operations';
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  priority: number; // Higher number = more privileges
}

// Define all available permissions
export const PERMISSIONS: Record<string, Permission> = {
  // Dashboard Views
  'view_overview': {
    id: 'view_overview',
    name: 'View Overview',
    description: 'Access to the main dashboard overview',
    category: 'dashboard'
  },
  'view_big5': {
    id: 'view_big5',
    name: 'View Big 5',
    description: 'Access to personal Big 5 priorities page',
    category: 'dashboard'
  },
  'view_scalable_impact': {
    id: 'view_scalable_impact',
    name: 'View Scalable Impact Planner',
    description: 'Access to the Scalable Impact Planner for business growth tracking',
    category: 'dashboard'
  },
  'view_wallet': {
    id: 'view_wallet',
    name: 'View Wallet',
    description: 'Access to wallet and financial overview',
    category: 'financial'
  },
  'view_portfolio': {
    id: 'view_portfolio',
    name: 'View Investment Portfolio',
    description: 'Access to investment portfolio and T-Bills tracking',
    category: 'financial'
  },
  'view_split_tracker': {
    id: 'view_split_tracker',
    name: 'View 50/30/20 Split',
    description: 'Access to budget split tracking and allocation',
    category: 'financial'
  },
  'view_goals': {
    id: 'view_goals',
    name: 'View Financial Goals',
    description: 'Access to financial goals and planning',
    category: 'financial'
  },
  'view_contacts': {
    id: 'view_contacts',
    name: 'View Contacts/CRM',
    description: 'Access to contact management and CRM features',
    category: 'management'
  },
  'view_library': {
    id: 'view_library',
    name: 'View Library',
    description: 'Access to document library and resources',
    category: 'system'
  },
  'view_assistant': {
    id: 'view_assistant',
    name: 'View AI Assistant',
    description: 'Access to AI assistant and automation features',
    category: 'system'
  },
  'view_settings': {
    id: 'view_settings',
    name: 'View Settings',
    description: 'Access to account and system settings',
    category: 'system'
  },

  // Business Management
  'view_estate': {
    id: 'view_estate',
    name: 'View Estate Management',
    description: 'Access to estate properties and tenant management',
    category: 'business'
  },
  'manage_estate': {
    id: 'manage_estate',
    name: 'Manage Estate',
    description: 'Full estate management including rent collection and maintenance',
    category: 'business'
  },
  'view_filling_station': {
    id: 'view_filling_station',
    name: 'View Filling Station',
    description: 'Access to filling station operations and data',
    category: 'business'
  },
  'manage_filling_station': {
    id: 'manage_filling_station',
    name: 'Manage Filling Station',
    description: 'Full filling station management and operations',
    category: 'business'
  },
  'view_equipment': {
    id: 'view_equipment',
    name: 'View Equipment Rental',
    description: 'Access to equipment rental tracking and availability',
    category: 'business'
  },
  'manage_equipment': {
    id: 'manage_equipment',
    name: 'Manage Equipment',
    description: 'Full equipment rental management and scheduling',
    category: 'business'
  },

  // Personal Life Portfolios
  'view_personal_portfolios': {
    id: 'view_personal_portfolios',
    name: 'View Personal Portfolios',
    description: 'Access to personal life portfolio tracking',
    category: 'financial'
  },
  'manage_personal_portfolios': {
    id: 'manage_personal_portfolios',
    name: 'Manage Personal Portfolios',
    description: 'Full personal portfolio management and allocation',
    category: 'financial'
  },

  // Reports and Analytics
  'view_reports': {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Access to financial and business reports',
    category: 'financial'
  },
  'manage_reports': {
    id: 'manage_reports',
    name: 'Manage Reports',
    description: 'Create and customize reports and analytics',
    category: 'financial'
  },

  // Financial Operations
  'make_payments': {
    id: 'make_payments',
    name: 'Make Payments',
    description: 'Ability to process payments and transactions',
    category: 'financial'
  },
  'view_payment_history': {
    id: 'view_payment_history',
    name: 'View Payment History',
    description: 'Access to payment records and transaction history',
    category: 'financial'
  },
  'manage_commissions': {
    id: 'manage_commissions',
    name: 'Manage Commissions',
    description: 'Process vendor commissions and payments',
    category: 'financial'
  },

  // Vendor Specific
  'upload_work_proof': {
    id: 'upload_work_proof',
    name: 'Upload Work Proof',
    description: 'Submit proof of completed work and services',
    category: 'business'
  },
  'track_commissions': {
    id: 'track_commissions',
    name: 'Track Commissions',
    description: 'View personal commission earnings and status',
    category: 'financial'
  },

  // Customer Specific
  'manage_payment_plans': {
    id: 'manage_payment_plans',
    name: 'Manage Payment Plans',
    description: 'View and manage installment plans and payment schedules',
    category: 'financial'
  },
  'track_projects': {
    id: 'track_projects',
    name: 'Track Projects',
    description: 'Monitor project progress and delivery stages',
    category: 'business'
  },

  // Strategic Hiring Permissions
  'view_strategic_hiring': {
    id: 'view_strategic_hiring',
    name: 'View Strategic Hiring',
    description: 'Access to strategic hiring dashboard and overview',
    category: 'business'
  },
  'view_hiring_triggers': {
    id: 'view_hiring_triggers',
    name: 'View Hiring Triggers',
    description: 'Monitor hiring triggers and productivity analysis',
    category: 'business'
  },
  'view_managing_like_a_boss': {
    id: 'view_managing_like_a_boss',
    name: 'View Managing Like a Boss',
    description: 'Access to the Managing Like a Boss planner and resources',
    category: 'management'
  },
  'manage_org_chart': {
    id: 'manage_org_chart',
    name: 'Manage Organization Chart',
    description: 'Create and modify organizational structure',
    category: 'business'
  },
  'create_job_descriptions': {
    id: 'create_job_descriptions',
    name: 'Create Job Descriptions',
    description: 'Generate and publish job descriptions',
    category: 'business'
  },
  'manage_candidates': {
    id: 'manage_candidates',
    name: 'Manage Candidates',
    description: 'Track and manage candidate applications',
    category: 'business'
  },
  'view_hiring_metrics': {
    id: 'view_hiring_metrics',
    name: 'View Hiring Metrics',
    description: 'Access hiring analytics and performance data',
    category: 'business'
  },
  'conduct_halo_research': {
    id: 'conduct_halo_research',
    name: 'Conduct Halo Research',
    description: 'Perform market research for strategic hiring',
    category: 'business'
  },

  // System Administration
  'manage_users': {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'User account management and role assignment',
    category: 'system'
  },
  'manage_system': {
    id: 'manage_system',
    name: 'System Administration',
    description: 'Full system configuration and maintenance',
    category: 'system'
  },
  'view_all_data': {
    id: 'view_all_data',
    name: 'View All Data',
    description: 'Access to all system data and records',
    category: 'system'
  },
  // Tenant/User permissions
  'submit_maintenance': {
    id: 'submit_maintenance',
    name: 'Submit Maintenance Request',
    description: 'Submit maintenance requests for the property',
    category: 'operations'
  },
  'view_maintenance': {
    id: 'view_maintenance',
    name: 'View Maintenance Requests',
    description: 'View submitted maintenance requests',
    category: 'operations'
  },
  'manage_visitors': {
    id: 'manage_visitors',
    name: 'Manage Visitors',
    description: 'Generate and manage visitor access codes',
    category: 'operations'
  },
  'view_notices': {
    id: 'view_notices',
    name: 'View Notices',
    description: 'View estate notices and announcements',
    category: 'operations'
  },
  'view_people': {
    id: 'view_people',
    name: 'View People',
    description: 'View people management',
    category: 'system'
  },
  'view_business_types': {
    id: 'view_business_types',
    name: 'View Business Types',
    description: 'View business types management',
    category: 'system'
  },
  'view_subscription': {
    id: 'view_subscription',
    name: 'View Subscriptions',
    description: 'View subscription management',
    category: 'system'
  },
  'manage_accounting': {
    id: 'manage_accounting',
    name: 'Manage Accounting',
    description: 'Access accounting management',
    category: 'financial'
  }
};

// Define role configurations
export const ROLE_CONFIGS: Record<string, RoleConfig> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Business owner with full access',
    priority: 100,
    permissions: [
      // All permissions - owner has access to everything
      ...Object.keys(PERMISSIONS)
    ]
  },

  business_owner: {
    id: 'business_owner',
    name: 'Business Owner',
    description: 'Estate owner with access to assigned properties',
    priority: 85,
    permissions: [
      'view_overview',

      'view_settings',
      'view_estate',
      'manage_estate',

      'view_assistant',
      'view_payment_history',
      'make_payments',
    ]
  },

  big7: {
    id: 'big7',
    name: 'Big 7 Member',
    description: 'Core team member with extensive access',
    priority: 90,
    permissions: [
      'view_overview',
      'view_big5',
      'view_scalable_impact',
      'view_wallet',
      'view_portfolio',
      'view_split_tracker',
      'view_goals',
      'view_contacts',
      'view_managing_like_a_boss',
      'view_library',
      'view_assistant',
      'view_settings',
      'view_personal_portfolios',
      'view_reports',
      'view_estate',
      'view_filling_station',
      'view_equipment',
      'view_payment_history',
      'manage_reports',
      'view_all_data',
      // Strategic Hiring
      'view_strategic_hiring',
      'view_hiring_triggers',
      'manage_org_chart',
      'create_job_descriptions',
      'manage_candidates',
      'view_hiring_metrics',
      'conduct_halo_research'
    ]
  },

  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'System administration and oversight',
    priority: 80,
    permissions: [
      'view_overview',
      'view_big5',
      'view_scalable_impact',
      'view_wallet',
      'view_portfolio',
      'view_split_tracker',
      'view_goals',
      'view_contacts',
      'view_managing_like_a_boss',
      'view_library',
      'view_assistant',
      'view_settings',
      'view_personal_portfolios',
      'view_reports',
      'view_estate',
      'view_filling_station',
      'view_equipment',
      'view_payment_history',
      'manage_reports',
      'view_all_data',
      'manage_users',
      // Strategic Hiring
      'view_strategic_hiring',
      'view_hiring_triggers',
      'manage_org_chart',
      'create_job_descriptions',
      'manage_candidates',
      'view_hiring_metrics',
      'conduct_halo_research'
    ]
  },

  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Departmental management and operations',
    priority: 60,
    permissions: [
      'view_overview',
      'view_big5',
      'view_scalable_impact',
      'view_wallet',
      'view_contacts',
      'view_managing_like_a_boss',
      'view_library',
      'view_assistant',
      'view_settings',
      'view_reports',
      // Business management based on department
      'view_estate',
      'manage_estate',
      'view_filling_station',
      'manage_filling_station',
      'view_equipment',
      'manage_equipment',
      'manage_commissions',
      'view_payment_history',
      // Strategic Hiring (limited)
      'view_strategic_hiring',
      'view_hiring_triggers',
      'manage_candidates',
      'conduct_halo_research'
    ]
  },

  super_manager: {
    id: 'super_manager',
    name: 'Super Manager',
    description: 'Senior management with expanded access',
    priority: 75,
    permissions: [
      'view_overview',
      'view_big5',
      'view_scalable_impact',
      'view_wallet',
      'view_portfolio',
      'view_split_tracker',
      'view_goals',
      'view_contacts',
      'view_managing_like_a_boss',
      'view_library',
      'view_assistant',
      'view_settings',
      'view_personal_portfolios',
      'view_reports',
      'view_estate',
      'manage_estate',
      'view_filling_station',
      'manage_filling_station',
      'view_equipment',
      'manage_equipment',
      'manage_commissions',
      'view_payment_history',
      'view_all_data',
      'view_strategic_hiring',
      'view_hiring_triggers',
      'manage_candidates',
      'view_hiring_metrics',
      'conduct_halo_research'
    ]
  },

  vendor: {
    id: 'vendor',
    name: 'Vendor Partner',
    description: 'Service delivery and proof submission',
    priority: 40,
    permissions: [
      'view_overview', // Limited overview showing only relevant info
      'view_big5',
      'view_contacts', // Can see contact info for coordination
      'view_settings', // Can manage their own account settings
      'upload_work_proof',
      'track_commissions',
      'view_payment_history', // Only their own payment history
      'make_payments' // Can make payments if needed
    ]
  },

  super_vendor: {
    id: 'super_vendor',
    name: 'Super Vendor',
    description: 'Senior vendor with expanded access',
    priority: 55,
    permissions: [
      'view_overview',
      'view_big5',
      'view_contacts',
      'view_settings',
      'upload_work_proof',
      'track_commissions',
      'view_payment_history',
      'make_payments',
      'view_wallet',
      'view_reports'
    ]
  },

  customer: {
    id: 'customer',
    name: 'Customer',
    description: 'Service consumption and payment management',
    priority: 20,
    permissions: [
      'view_overview', // Limited overview showing account summary
      'view_big5',
      'view_settings', // Can manage their own account settings
      'manage_payment_plans',
      'track_projects',
      'make_payments',
      'view_payment_history' // Only their own payment history
    ]
  },

  tenant: {
    id: 'tenant',
    name: 'Tenant',
    description: 'Rent payment and maintenance management',
    priority: 25,
    permissions: [
      'view_overview',
      'view_settings',
      'make_payments',
      'view_payment_history',
      'submit_maintenance',
      'view_maintenance',
      'manage_visitors',
      'view_notices'
    ]
  },

  user: {
    id: 'user',
    name: 'User',
    description: 'Basic resident access',
    priority: 15,
    permissions: [
      'view_overview',
      'view_settings',
      'make_payments',
      'view_payment_history',
      'submit_maintenance',
      'view_maintenance'
    ]
  }
};

// Utility functions
export const getRoleConfig = (role: string): RoleConfig | undefined => {
  return ROLE_CONFIGS[role];
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const roleConfig = getRoleConfig(userRole);
  return roleConfig?.permissions.includes(permission) ?? false;
};

export const hasAnyPermission = (userRole: string, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: string, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const getUserPermissions = (userRole: string): Permission[] => {
  const roleConfig = getRoleConfig(userRole);
  if (!roleConfig) return [];

  return roleConfig.permissions
    .map(permissionId => PERMISSIONS[permissionId])
    .filter(Boolean);
};

export const getPermissionsByCategory = (userRole: string, category: Permission['category']): Permission[] => {
  return getUserPermissions(userRole).filter(permission => permission.category === category);
};

// Navigation items with their required permissions
export const NAVIGATION_PERMISSIONS: Record<string, string[]> = {
  'overview': ['view_overview'],
  'billionaire-os': ['view_overview'],
  'defining-your-number': ['view_big5'],
  'scalable-impact-planner': ['view_scalable_impact'],
  'wallet': ['view_wallet'],
  'portfolio': ['view_portfolio'],
  'split-tracker': ['view_split_tracker'],
  'goals': ['view_goals'],
  'contacts': ['view_contacts'],
  'library': ['view_library'],
  'assistant': ['view_assistant'],
  'settings': ['view_settings'],
  'estate': ['view_estate'],
  'filling-station': ['view_filling_station'],
  'equipment': ['view_equipment'],
  'personal-portfolios': ['view_personal_portfolios'],
  // Strategic Hiring Navigation
  'strategic-hiring-planner': ['view_strategic_hiring', 'view_hiring_triggers'],
  'managing-like-a-boss': ['view_managing_like_a_boss'],
  'candidate-management': ['view_strategic_hiring', 'manage_candidates'],
  'reports': ['view_reports'],
  'transactions': ['view_all_data'],
  'theme-showcase': ['view_overview'], // Available to everyone who can view overview
  'admin': ['manage_users', 'manage_system'],
  'system': ['manage_system', 'view_all_data'],
  // System Tools
  'people': ['view_people', 'manage_users'],
  'business-types': ['view_business_types', 'manage_business_types'],
  'subscription': ['view_subscription', 'manage_subscription'],
  // Financial
  'accounting': ['view_all_data', 'manage_accounting']
};