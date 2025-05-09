// components/profile/types.ts
import { FormData } from '@/stores/formStore';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  github: string;
  gender: 'male' | 'female' | 'prefer-not-to-say' | '';
  telegramHandle: string;
  graduationYear: number | null;
  specialization: string;
  department: string;
  mentor: string;
  universityId: string | null;
  instagramHandle: string | null;
  linkedinHandle: string | null;
  codeforcesHandle: string | null;
  cv: string | null;
  leetcodeHandle: string | null;
  createdAt: string;
  bio: string | null;
  profilePicture: string | null;
}

export interface Resource {
  name: string;
  link: string;
}

export interface RequiredFormProps {
  data: Pick<FormData, 
    | 'firstName'
    | 'lastName'
    | 'phoneNumber'
    | 'email'
    | 'birthDate'
    | 'github'
    | 'gender'
    | 'telegramHandle'
    | 'graduationYear'
    | 'specialization'
    | 'department'
    | 'mentor'
  >;
  onUpdate: (data: Partial<Member>) => void;
  onNext: () => void;
}

export interface OptionalFormProps {
  data: Pick<FormData,
    | 'universityId'
    | 'linkedin'
    | 'codeforces'
    | 'leetcode'
    | 'instagram'
    | 'cv'
    | 'joiningDate'
    | 'bio'
  >;
  onUpdate: (data: Partial<Member>) => void;
  onNext: () => void;
}

export interface ResourcesFormProps {
  resources: Resource[];
  onUpdate: (resources: Resource[]) => void;
}