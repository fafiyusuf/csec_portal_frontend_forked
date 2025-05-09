import { Member } from './member';

export interface Head {
    id: string
    name: string
    avatar: string
    division: string
    role: string
    email: string
    membershipStatus : string
  }
  
  export interface Role {
    id: string
    name: string
    status: "active" | "inactive"
    permissions: string[]
  }
  
  export interface Rules {
   ClubRules : {
      maxAbsences: number
      warningAfter: number
      suspendAfter: number
      fireAfter: number
    }
  }
  
  
  
  export type { Member };
  