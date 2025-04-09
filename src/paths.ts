import { sources } from "next/dist/compiled/webpack/webpack";

export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    otp: '/auth/otp-page',
    verifyEmail: '/auth/verify-email',
    verifyOtp: '/auth/verify-otp',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    MobileNumber: '/auth/phone-page',
  },
  dashboard: {
    home: '/dashboard', // CRM Dashboard homepage

    leads: {
      newLead: '/dashboard/leads/new-lead',
      leadList: '/dashboard/leads/lead-list', // Changed name to better reflect a lead listing
    },

    followUps: {
      followUpList: '/dashboard/follow-ups/list', // For viewing all follow-ups
      myFollowUps: '/dashboard/follow-ups/my-follow-ups', // Suggested name for "Follow-ups assigned to me"
    },

    customer: {
      newCustomer: '/dashboard/customer/new-entry', // For viewing all follow-ups
      customerList: '/dashboard/customer/list', // Suggested name for "Follow-ups assigned to me"
    },

    deals: {
      newDeals: '/dashboard/deals/new-entry', // For viewing all follow-ups
      dealLists: '/dashboard/deals/list', // Suggested name for "Follow-ups assigned to me"
      customerDeals: '/dashboard/deals/customer-deals', // Suggested name for "Follow-ups assigned to me"
    },

    ams: {
      createAms: '/dashboard/ams/create-ams', // For viewing all follow-ups
      listAms: '/dashboard/ams/list-ams', // Suggested name for "Follow-ups assigned to me"
      myFollowUps: '/dashboard/ams/my-follow-ups', // Suggested name for "Follow-ups assigned to me"
    },


    accounts: {
      company: '/dashboard/accounts/company', // For viewing all follow-ups
      employee: '/dashboard/accounts/employee', // Suggested name for "Follow-ups assigned to me"
      products: '/dashboard/accounts/products',
      source: '/dashboard/accounts/source', // Suggested name for "Follow-ups assigned to me"
      customerCategory: '/dashboard/accounts/customer-category', // Suggested name for "Follow-ups assigned to me"
    },


    settings: '/dashboard/settings', // User settings 
  },
  errors: { notFound: '/errors/not-found' },
} as const;
