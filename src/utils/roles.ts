// utils/roles.ts

export type UserRole = 
  | 'President'
  | 'Vice President'
  | 'Competitive Programming Division President'
  | 'Development Division President'
  | 'Capacity Building Division President'
  | 'Cybersecurity Division President'
  | 'Data Science Division President'
  | 'Member';

export const isMember = (role: UserRole | undefined): boolean => {
  return role === 'Member';
};

export const isCPDPresident = (role: UserRole | undefined): boolean => {
  return role === 'Competitive Programming Division President';
};

export const isDevPresident = (role: UserRole | undefined): boolean => {
  return role === 'Development Division President';
};

export const isCBDPresident = (role: UserRole | undefined): boolean => {
  return role === 'Capacity Building Division President';
};

export const isSECPresident = (role: UserRole | undefined): boolean => {
  return role === 'Cybersecurity Division President';
};

export const isDSPresident = (role: UserRole | undefined): boolean => {
  return role === 'Data Science Division President';
};

export const isPresident = (role: UserRole | undefined): boolean => {
  return role === 'President' || role === 'Vice President';
};

export const isDivisionPresident = (role: UserRole | undefined): boolean => {
  return isCPDPresident(role) || isDevPresident(role) || isCBDPresident(role) || isSECPresident(role) || isDSPresident(role);
};

export const canViewAdminPanel = (role: UserRole | undefined): boolean => {
  return isPresident(role);
};

export const canAddMembers = (role: UserRole | undefined): boolean => {
  if (!role) return false;
  if (role === 'Member') return false;
  return isPresident(role) || isDivisionPresident(role);
};

export const canDeleteMembers = (role: UserRole | undefined): boolean => {
  return isPresident(role);
};

export const canViewMembers = (role: UserRole | undefined): boolean => {
  return true; // All roles can view members
};

export const canManageDivision = (role: UserRole | undefined, division: string): boolean => {
  if (!role) return false;
  
  switch (division) {
    case 'CPD':
      return isCPDPresident(role) || isPresident(role);
    case 'Dev':
      return isDevPresident(role) || isPresident(role);
    case 'CBD':
      return isCBDPresident(role) || isPresident(role);
    case 'SEC':
      return isSECPresident(role) || isPresident(role);
    case 'DS':
      return isDSPresident(role) || isPresident(role);
    default:
      return false;
  }
};