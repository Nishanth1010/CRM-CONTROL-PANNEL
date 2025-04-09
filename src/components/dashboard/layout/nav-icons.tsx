import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { 
  Gauge as DashboardIcon, 
  Sliders as SettingsIcon, 
  Users as AccountsIcon, 
  UsersFour as LeadsIcon, 
  NotePencil as FollowUpsIcon, 
  UserPlus as NewEntryIcon, 
  ListDashes as ListIcon, 
  AddressBook as MyFollowUpsIcon, 
  UserCirclePlus as NewCustomerIcon, 
  IdentificationBadge as CustomerListIcon, 
  Handshake as DealsIcon, 
  FileArrowUp as NewDealIcon, 
  FileText as DealListIcon, 
  UsersThree as DealCustomerIcon,
  GearSix as AdminControlsIcon,
  Buildings as CompanyIcon, // New, more attractive icon for Company
  UsersThree as EmployeesIcon, // Updated to a more engaging icon
  Package as ProductsIcon // Updated to better represent products
} from '@phosphor-icons/react'; // Updated icons for a more modern and field-relevant appearance

export const navIcons = {
  // General sections
  'dashboard': DashboardIcon,
  'accounts': AccountsIcon, // For account management

  // Accounts section (updated icons)
  'company': CompanyIcon, // Updated icon for Company
  'employees': EmployeesIcon, // Updated icon for Employees
  'products': ProductsIcon, // Updated icon for Products
  'source' : LeadsIcon, // Updated icon for

  // Leads section
  'leads': LeadsIcon,
  'new-lead': NewEntryIcon, // For new lead entry
  'lead-list': ListIcon, // For lead list

  // Follow-ups section
  'follow-ups': FollowUpsIcon,
  'my-follow-ups': MyFollowUpsIcon, // For "my follow-ups"
  'follow-up-list': FollowUpsIcon, // For follow-up list

  // Customers section
  'customer': MyFollowUpsIcon,
  'new-customer': NewCustomerIcon, // For adding a new customer
  'customer-list': CustomerListIcon, // For viewing customer list
  // AMS sections
  'ams': DashboardIcon,
  'create-ams': NewEntryIcon, // For creating a new AMS
  'list-ams': ListIcon, // For viewing AMS list
  

  
  // Deals section
  'deals': DealsIcon,
  'new-deal': NewDealIcon, // For adding a new deal
  'deal-list': DealListIcon, // For viewing deal list
  'customer-deals': DealCustomerIcon, // For deals associated with customers
  // Settings section
  'settings': SettingsIcon, // Settings

  'admin-controls' : AdminControlsIcon,
} as Record<string, Icon>;