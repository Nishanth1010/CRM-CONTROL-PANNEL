import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.home, icon: 'dashboard' },
  {
    key: 'leads',
    title: 'Leads',
    icon: 'leads',
    children: [
      { key: 'new-lead', title: 'New Lead', href: paths.dashboard.leads.newLead, icon: 'new-lead' },
      { key: 'lead-list', title: 'Lead List', href: paths.dashboard.leads.leadList, icon: 'lead-list' },
    ],
  },
  {
    key: 'follow-ups',
    title: 'Follow Ups',
    icon: 'follow-ups',
    children: [
      { key: 'my-follow-ups', title: "Today's follow ups",  href: paths.dashboard.followUps.myFollowUps, icon: 'my-follow-ups' },
      { key: 'follow-up-list', title: 'Follow Up List', href: paths.dashboard.followUps.followUpList, icon: 'follow-up-list' },
    ],
  },
  {
    key: 'customers',
    title: 'Customers',
    icon: 'customer',
    children: [
      { key: 'new-customer', title: 'New Customer', href: paths.dashboard.customer.newCustomer, icon: 'new-customer' },
      { key: 'customer-list', title: 'Customer List', href: paths.dashboard.customer.customerList, icon: 'customer-list' },
    ],
  },
  {
    key: 'deals',
    title: 'Deals',
    icon: 'deals',
    children: [
      { key: 'new-deal', title: 'New Deal', href: paths.dashboard.deals.newDeals, icon: 'new-deal' },
      { key: 'deal-list', title: 'Deal List', href: paths.dashboard.deals.dealLists, icon: 'deal-list' },
      { key: 'customer-deals', title: 'Customer Deals', href: paths.dashboard.deals.customerDeals, icon: 'customer-deals' },
    ],
  },
  {
    key: 'ams',
    title: 'AMS',
    icon: 'ams',
    children: [
      {key: 'create-ams', title: 'Create AMS', href: paths.dashboard.ams.createAms, icon: 'create-ams'},
      {key: 'list-ams', title: 'List AMS', href: paths.dashboard.ams.listAms, icon: 'list-ams'},
      {key: 'my-follow-ups', title: "Today's follow ups",  href: paths.dashboard.ams.myFollowUps, icon: 'my-follow-ups'},
    ],
  },
  
  {
    key: 'accounts',
    title: 'Admin Controls',
    icon: 'admin-controls',
    children: [
      { key: 'company', title: 'Company', href: paths.dashboard.accounts.company, icon: 'company' },
      { key: 'employees', title: 'Employees', href: paths.dashboard.accounts.employee, icon: 'employees' },
      { key: 'products', title: 'Products', href: paths.dashboard.accounts.products, icon: 'products' },
      { key: 'source', title: 'Source', href: paths.dashboard.accounts.source, icon: 'source' },
      { key: 'category', title: 'Customer Category', href: paths.dashboard.accounts.customerCategory, icon: 'customer' },
    ],
  },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'settings' },
] satisfies NavItemConfig[];