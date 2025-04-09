// types.ts

export type UserCoreData = {
    title: string;
    name: string;
    bniId?: string;
    gender: string;
    company: string;
    email: string;
    mobile: string;
    chapter: string;
    dob?: string; // date in ISO format
    doj?: string; // date in ISO format
    city: string;
    state: string;
    country: string;
    team: string;
    role1?: string;
    responsibility1?: string;
    role2?: string;
    responsibility2?: string;
    sequence?: number;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'SECRETORY' | 'SA_COORDINATOR' | 'USER' | 'SUPER_USER';
  };
  
  export type MembershipData = {
    userId?: string; // we'll provide this after selecting the user
    dateOfJoin: string; // ISO date
    numberOfYears: 1 | 2;
    expireDate: string; // ISO date
    userStatus: 'Active' | 'Inactive' | 'Suspended';
    lastPaymentDate?: string; // ISO date
  };
  
  export type MembershipTransactionData = {
    membershipId: string; // we'll provide this after creating membership
    userId: string; // we'll provide this after selecting the user
    paidAmount: number;
    paidDate: string; // ISO date
    paymentMethod: 'Cash' | 'Card' | 'UPI';
    referenceNumber?: string;
  };
  

  export type FormData = UserCoreData & MembershipData & MembershipTransactionData;
