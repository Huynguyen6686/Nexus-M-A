import { Deal, UserProfile, UserRole } from '../types';

export type Permission =
  | 'admin.access'
  | 'admin.manageDeals'
  | 'admin.manageUsers'
  | 'admin.verifyKyc'
  | 'deal.create'
  | 'deal.manageOwn'
  | 'deal.publishApproved'
  | 'deal.submitOffer'
  | 'deal.counterOffer'
  | 'deal.chat'
  | 'vdr.upload'
  | 'vdr.unlock'
  | 'dashboard.view'
  | 'profile.edit';

type RolePermissionMap = Record<UserRole, Permission[]>;

export const rolePermissions: RolePermissionMap = {
  buyer: ['deal.submitOffer', 'deal.chat', 'vdr.unlock', 'dashboard.view', 'profile.edit'],
  seller: ['deal.create', 'deal.manageOwn', 'deal.counterOffer', 'deal.chat', 'vdr.upload', 'dashboard.view', 'profile.edit'],
  advisor: ['deal.submitOffer', 'deal.chat', 'vdr.unlock', 'dashboard.view', 'profile.edit'],
  admin: [
    'admin.access',
    'admin.manageDeals',
    'admin.manageUsers',
    'admin.verifyKyc',
    'deal.create',
    'deal.manageOwn',
    'deal.publishApproved',
    'deal.submitOffer',
    'deal.counterOffer',
    'deal.chat',
    'vdr.upload',
    'vdr.unlock',
    'dashboard.view',
    'profile.edit',
  ],
};

export function roleLabelKey(role: UserRole) {
  return {
    buyer: 'roleBuyer',
    seller: 'roleSeller',
    advisor: 'roleAdvisor',
    admin: 'roleAdmin',
  }[role];
}

export function hasRole(profile: UserProfile | null | undefined, roles: UserRole[]) {
  return Boolean(profile && roles.includes(profile.userType));
}

export function isAdmin(profile: UserProfile | null | undefined) {
  return hasRole(profile, ['admin']);
}

export function isSeller(profile: UserProfile | null | undefined) {
  return hasRole(profile, ['seller']);
}

export function isBuyerLike(profile: UserProfile | null | undefined) {
  return hasRole(profile, ['buyer', 'advisor']);
}

export function hasPermission(profile: UserProfile | null | undefined, permission: Permission) {
  if (!profile) return false;
  return rolePermissions[profile.userType].includes(permission);
}

export function canCreateDeal(profile: UserProfile | null | undefined) {
  return hasPermission(profile, 'deal.create');
}

export function canAccessAdmin(profile: UserProfile | null | undefined) {
  return hasPermission(profile, 'admin.access');
}

export function canSubmitOffer(profile: UserProfile | null | undefined, deal?: Deal | null) {
  if (!profile || !hasPermission(profile, 'deal.submitOffer')) return false;
  return profile.userType === 'admin' || deal?.status === 'published';
}

export function canManageDeal(profile: UserProfile | null | undefined, userId?: string | null, deal?: Deal | null) {
  if (!profile || !deal) return false;
  return profile.userType === 'admin' || (hasPermission(profile, 'deal.manageOwn') && deal.sellerId === userId);
}

export function canCounterOffer(profile: UserProfile | null | undefined, userId?: string | null, deal?: Deal | null) {
  if (!profile || !deal) return false;
  return profile.userType === 'admin' || (hasPermission(profile, 'deal.counterOffer') && deal.sellerId === userId);
}

export function canUploadVdr(profile: UserProfile | null | undefined, userId?: string | null, deal?: Deal | null) {
  return canManageDeal(profile, userId, deal) && hasPermission(profile, 'vdr.upload');
}

export function canUnlockVdr(profile: UserProfile | null | undefined, userId?: string | null, deal?: Deal | null) {
  if (!profile || !deal) return false;
  if (canManageDeal(profile, userId, deal)) return true;
  return hasPermission(profile, 'vdr.unlock') && profile.kycStatus === 'verified' && deal.status === 'published';
}

export function routeRoles(route: 'admin' | 'createDeal' | 'marketing') {
  const map: Record<typeof route, UserRole[]> = {
    admin: ['admin'],
    createDeal: ['seller', 'admin'],
    marketing: ['seller', 'advisor', 'admin'],
  };
  return map[route];
}
