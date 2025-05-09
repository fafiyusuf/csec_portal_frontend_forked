// types/member.ts
export type UserRole = 
  | 'President'
  | 'Vice President'
  | 'Competitive Programming Division President'
  | 'Development Division President'
  | 'Capacity Building Division President'
  | 'Cybersecurity Division President'
  | 'Data Science Division President'
  | 'Member';

export interface Member {
  _id: string;
  member_id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  telegramHandle?: string;
  phoneNumber?: string;
  graduationYear?: string;
  profilePicture?: string | null;
  clubRole?: UserRole;
  division?: string;
  divisionRole?: string;
  status?: string;
  createdAt?: string;
  lastSeen?: string;
  Attendance?: string;
  campusStatus?: string;
  token?: string;
  refreshToken?: string;
  birthDate?: string;
  gender?: string;
  universityId?: string;
  linkedinHandle?: string;
  codeforcesHandle?: string;
  leetcodeHandle?: string;
  instagramHandle?: string;
  bio?: string;
  cv?: string;
  role?: string;
  mentor?: string;
  specialization?: string;
  department?: string;
  github?: string;
  resource?: Array<string>;
  resources?: Array<string>;
  banned?: boolean;
  membershipStatus?: string;
  group?: string;
  mustChangePassword?: boolean;
}
   
