import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface FormData {
  profilePicture: File | string | null;
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
  universityId: string;
  instagramHandle: string | null;
  linkedinHandle: string | null;
  codeforcesHandle: string | null;
  cv: string | null;
  leetcode: string | null;
  // joiningDate: string | null;
  bio: string | null;
}

interface FormState {
  step: number;
  formData: FormData;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<FormData>) => void;
  resetForm: () => void;
  setProfilePicture: (file: File | string) => void;
}

const initialState: FormData = {
  email: '',
  bio: null,
  birthDate: '',
  cv: null,
  department: '',
  firstName: '',
  github: '',
  graduationYear: null,
  lastName: '',
  mentor: '',
  phoneNumber: '',
  specialization: '',
  telegramHandle: '',
  universityId: '',
  gender: '',
  leetcode: null,
  linkedinHandle: null,
  codeforcesHandle: null,
  instagramHandle: null,
  // joiningDate: null,
  profilePicture: null,
};

const useFormStore = create<FormState>()(
  immer((set) => ({
    step: 1,
    formData: { ...initialState },
    setStep: (step: number) => set({ step }),
    updateFormData: (data: Partial<FormData>) =>
      set((state) => {
        Object.assign(state.formData, data);
      }),
    resetForm: () => set(() => ({ formData: { ...initialState } })),
    setProfilePicture: (file: File | string) =>
      set((state) => {
        state.formData.profilePicture = file;
      }),
  }))
);

export default useFormStore;