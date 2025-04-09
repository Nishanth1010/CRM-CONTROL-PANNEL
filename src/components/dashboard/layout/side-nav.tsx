"use client";

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { navItems } from './config';
import { navIcons } from './nav-icons';
import { CaretDown, CaretUp } from '@phosphor-icons/react';
import { NavItemConfig } from '@/types/nav';
import { isNavItemActive } from '@/lib/is-nav-item-active';

type CompanyAccessLevel = 'LEADS' | 'CUSTOMER' | 'AMS' | 'FULL' ;
type AccessLevel = 'ALL_ACCESS' | 'LEADS' | 'FOLLOW_UPS' | 'CUSTOMER' | 'DEALS' | 'AMS' | 'ADMIN';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  const [accessLevel, setAccessLevel] = React.useState<AccessLevel | null>(null);
  const [companyAccessLevel, setCompanyAccessLevel] = React.useState<CompanyAccessLevel | null>(null);

  // Get access level from localStorage using useEffect to ensure SSR safety
  React.useEffect(() => {
    const storedAccess = localStorage.getItem('access');
    const storedCompanyAccess = localStorage.getItem('companyAccess');
    if (storedAccess) setAccessLevel(storedAccess as AccessLevel);
    if (storedCompanyAccess) setCompanyAccessLevel(storedCompanyAccess as CompanyAccessLevel);
  }, []);

  // Filter nav items based on access level and company access level
  const filteredNavItems = React.useMemo(() => {
    if (!accessLevel || !companyAccessLevel) return [];
    let accessibleItems: NavItemConfig[] = [];

    switch (accessLevel) {
      case 'ALL_ACCESS':
        accessibleItems = navItems.filter((item) => ['dashboard', 'follow-ups', 'leads', 'settings' , 'customers' ,'ams' , 'deals' , 'settings' ].includes(item.key));
        break;
      case 'ADMIN':
        accessibleItems = navItems; // Show all items
        break;
      case 'FOLLOW_UPS':
        accessibleItems = navItems.filter((item) => ['dashboard', 'follow-ups', 'settings'].includes(item.key));
        break;
      case 'LEADS':
        accessibleItems = navItems.filter((item) => ['dashboard', 'leads', 'settings'].includes(item.key));
        break;
      case 'CUSTOMER':
          accessibleItems = navItems.filter((item) => ['dashboard', 'customers', 'deals' , 'settings'].includes(item.key));
          break;
      case 'AMS':
         accessibleItems = navItems.filter((item) => ['dashboard', 'ams' , 'settings'].includes(item.key));
         break;
      default:
        accessibleItems = []; // Hide everything if no access level matches
    }

    // Further filter based on company access level
    switch (companyAccessLevel) {
      case 'LEADS':
        accessibleItems = accessibleItems.filter((item) => ['dashboard', 'leads' , 'follow-ups' , 'accounts' ,  'settings'].includes(item.key));
        break;
      case 'CUSTOMER':
        accessibleItems = accessibleItems.filter((item) => ['dashboard', 'customers' , 'deals' , 'accounts' ,  'settings'].includes(item.key));
        break;
      case 'AMS':
        accessibleItems = accessibleItems.filter((item) => ['dashboard', 'ams', 'accounts' , 'settings'].includes(item.key));
        break;
      case 'FULL':
        // No additional filtering needed for FULL access
        break;
      default:
        accessibleItems = []; // Hide everything if no company access level matches
    }

    return accessibleItems;
  }, [accessLevel, companyAccessLevel]);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prevKey) => (prevKey === key ? null : key));
  };

  return (
    <Box
    sx={{
      '--SideNav-background': '#FFFFFF',
      '--SideNav-color': '#1F2937',
      '--NavItem-color': '#374151',
      '--NavItem-hover-background': '#F3F4F6',
      '--NavItem-active-background': '#2563EB',
      '--NavItem-active-color': '#FFFFFF',
      '--NavItem-hover-color': '#2563EB',
      '--NavItem-icon-color': '#6B7280',
      '--NavItem-icon-hover-color': '#2563EB',
      '--NavItem-icon-active-color': '#FFFFFF',
      bgcolor: 'var(--SideNav-background)',
      color: 'var(--SideNav-color)',
      display: { xs: 'none', lg: 'flex' },
      flexDirection: 'column',
      height: '100vh',
      overflowY: 'auto',
      left: 0,
      maxWidth: '100%',
      position: 'fixed',
      top: 0,
      width: '280px',
      zIndex: 1,
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  
      // Custom Scrollbar Styles
      '&::-webkit-scrollbar': {
        width: '2px',
      },
      '&::-webkit-scrollbar-track': {
        background: '#F3F4F6',
        borderRadius: '4px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#ccc',
        borderRadius: '4px',
        '&:hover': {
          background: '#ccc',
        },
      },
    }}
  >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href="/" sx={{ display: 'inline-flex' }}>
          <Box component="img" alt="Widgets" src="/assets/logo--dark.png" sx={{ height: 'auto', width: '100%' }} />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: '#E5E7EB' }} />

      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredNavItems, openDropdown, toggleDropdown })}
      </Box>

      <Divider sx={{ borderColor: '#E5E7EB' }} />
    </Box>
  );
}

// Helper function to render nav items
function renderNavItems({
  items = [],
  pathname,
  openDropdown,
  toggleDropdown,
}: {
  items?: NavItemConfig[];
  pathname: string;
  openDropdown: string | null;
  toggleDropdown: (key: string) => void;
}): React.JSX.Element {
  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map(({ key, ...item }) => (
        <NavItem
          key={key}
          pathname={pathname}
          {...item}
          isOpen={openDropdown === key}
          onToggle={() => toggleDropdown(key)}
        />
      ))}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  children,
  isOpen,
  onToggle,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        component={href ? (external ? 'a' : RouterLink) : 'div'}
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        onClick={children ? (e: React.MouseEvent) => { e.preventDefault(); onToggle(); } : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          borderRadius: '8px',
          color: active ? 'var(--NavItem-active-color)' : 'var(--NavItem-color)',
          textDecoration: 'none',
          cursor: 'pointer',
          backgroundColor: active ? 'var(--NavItem-active-background)' : 'inherit',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.3s, color 0.3s',
          boxShadow: active ? '0 2px 8px rgba(0, 123, 255, 0.2)' : 'none',
          '&:hover': {
            backgroundColor: 'var(--NavItem-hover-background)',
            color: 'var(--NavItem-hover-color)',
            '& svg': { color: 'var(--NavItem-icon-hover-color)' },
          },
        }}
        aria-expanded={children ? isOpen : undefined}
        aria-haspopup={children ? 'true' : undefined}
      >
        {Icon && (
          <span style={{ marginRight: '10px', color: active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)' }}>
            <Icon />
          </span>
        )}
        <span style={{ flex: '1', fontSize: '0.875rem', fontWeight: '500' }}>{title}</span>
        {children && (
          <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--NavItem-color)' }}>
            {isOpen ? <CaretUp /> : <CaretDown />}
          </span>
        )}
      </Box>

      {/* Render dropdown children */}
      <Box
        sx={{
          maxHeight: isOpen ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          ml: '20px',
        }}
      >
        {isOpen && children && (
          <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {children.map((child) => (
              <li key={child.key}>
                <Box
                  component={RouterLink}
                  href={child.href as string}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 16px',
                    color: pathname === child.href ? 'var(--NavItem-active-color)' : 'var(--NavItem-color)',
                    backgroundColor: pathname === child.href ? 'var(--NavItem-active-background)' : 'inherit',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background-color 0.3s, color 0.3s',
                    boxShadow: pathname === child.href ? '0 2px 8px rgba(0, 123, 255, 0.2)' : 'none',
                    '&:hover': {
                      backgroundColor: 'var(--NavItem-hover-background)',
                      color: 'var(--NavItem-hover-color)',
                    },
                  }}
                >
                  {child.icon && (
                    <span style={{ marginRight: '10px' }}>
                      {navIcons[child.icon] && React.createElement(navIcons[child.icon])}
                    </span>
                  )}
                  <span>{child.title}</span>
                </Box>
              </li>
            ))}
          </Stack>
        )}
      </Box>
    </li>
  );
}
