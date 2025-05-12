import { UserRole } from '@/utils/roles';

// Map of division names to their corresponding division head roles
export const DIVISION_HEADS = {
  'Data Science': 'Data Science Division President',
  'Cybersecurity': 'Cybersecurity Division President',
  'Development': 'Development Division President',
  'Competitive Programming': 'Competitive Programming Division President',
  'Capacity Building': 'Capacity Building Division President'
} as const;

// Helper function to check if a role is a division head role
export function isDivisionHead(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role.endsWith('Division President') && role !== 'President' && role !== 'Vice President';
}

// Helper function to get the division from a role
export function getDivisionFromRole(role: UserRole | undefined): string | null {
  if (!role) return null;
  
  if (role === 'President' || role === 'Vice President') {
    return 'all';
  }

  // Extract division name from role (e.g., "Data Science Division President" -> "Data Science Division")
  if (role.endsWith('Division President')) {
    return role.replace(' Division President', ' Division');
  }

  return null;
}

// Check if a user can view a specific division
export function canViewDivision(user: { member?: { clubRole?: UserRole } } | null): boolean {
  if (!user?.member?.clubRole) return false;
  return true; // All authenticated users can view divisions
}

// Check if a user can manage a specific division
export function canManageDivision(role: UserRole | undefined, division: string): boolean {
  if (!role || role === 'Member') return false;
  if (role === 'President' || role === 'Vice President') return true;
  const userDivision = getDivisionFromRole(role);
  return userDivision === division;
}

// Check if a user can manage groups in a specific division
export function canManageGroups(role: UserRole | undefined, division: string): boolean {
  if (!role || role === 'Member') return false;
  if (role === 'President' || role === 'Vice President') return true;
  const userDivision = getDivisionFromRole(role);
  return userDivision === division;
}

// Check if a user can manage members in a specific division
export function canManageMembers(role: UserRole | undefined, division: string): boolean {
  if (!role || role === 'Member') return false;
  if (role === 'President' || role === 'Vice President') return true;
  const userDivision = getDivisionFromRole(role);
  return userDivision === division;
}

// Check if a user can add members to a specific division
export function canAddMembersToDivision(role: UserRole | undefined, division: string): boolean {
  if (!role || role === 'Member') return false;
  if (role === 'President' || role === 'Vice President') return true;
  const userDivision = getDivisionFromRole(role);
  return userDivision === division;
}

// Check if a user can add new divisions
export function canAddDivision(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === 'President' || role === 'Vice President';
}

// Check if a user can create sessions and events
export function canCreateSessionsAndEvents(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === 'President' || role === 'Vice President' || role.endsWith('Division President');
}

// Check if a user can manage sessions and events for a specific division
export function canManageSessionsAndEvents(role: UserRole | undefined, division: string): boolean {
  if (!role) return false;
  if (role === 'President' || role === 'Vice President') return true;
  if (role === 'Member') return false;
  const userDivision = getDivisionFromRole(role);
  return userDivision === division;
}

// Helper function to get division head role from division name
export function getDivisionHeadRole(divisionName: string): string {
  return `${divisionName} Division President`;
} 