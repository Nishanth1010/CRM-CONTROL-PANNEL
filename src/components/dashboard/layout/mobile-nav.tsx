"use client";

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import { CaretUp, CaretDown } from '@phosphor-icons/react';
import { Close as CloseIcon } from '@mui/icons-material';

import { navItems } from './config';
import { navIcons } from './nav-icons';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { NavItemConfig } from '@/types/nav';

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  // Retrieve the user's access level from localStorage
  const accessLevel = React.useMemo(() => localStorage.getItem('access'), []);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prevKey) => (prevKey === key ? null : key));
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box
        sx={{
          '--MobileNav-background': '#FFFFFF',
          '--MobileNav-color': '#1F2937',
          '--NavItem-color': '#374151',
          '--NavItem-hover-background': '#EBF8FF',
          '--NavItem-active-background': '#007BFF',
          '--NavItem-active-color': '#FFFFFF',
          '--NavItem-hover-color': '#007BFF',
          '--NavItem-icon-color': '#6B7280',
          '--NavItem-icon-hover-color': '#007BFF',
          '--NavItem-icon-active-color': '#FFFFFF',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          width: '80vw',
          height: '100vh',
          p: 2,
        }}
      >
        {/* Close button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={onClose} sx={{ color: 'var(--MobileNav-color)' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Logo */}
        <Stack spacing={2} sx={{ p: 3 }}>
          <Box component={RouterLink} href="/" sx={{ display: 'inline-flex' }} onClick={onClose}>
            <Box component="img" alt="Widgets" src="/assets/logo--dark.png" sx={{ height: 'auto', width: '50%' }} />
          </Box>
        </Stack>

        <Divider sx={{ borderColor: '#E5E7EB' }} />

        {/* Navigation Items */}
        <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
          {renderNavItems({ pathname, items: navItems, openDropdown, toggleDropdown, onClose, accessLevel })}
        </Box>

        <Divider sx={{ borderColor: '#E5E7EB' }} />
      </Box>
    </Drawer>
  );
}

function renderNavItems({
  items = [],
  pathname,
  openDropdown,
  toggleDropdown,
  onClose,
  accessLevel,
}: {
  items?: NavItemConfig[];
  pathname: string;
  openDropdown: string | null;
  toggleDropdown: (key: string) => void;
  onClose: () => void;
  accessLevel: string | null;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    // Conditionally render based on access level
    if (
      (accessLevel === 'ALL_ACCESS' && ['dashboard', 'follow-ups', 'leads', 'settings'].includes(curr.key)) ||
      (accessLevel === 'ADMIN') ||
      (accessLevel === 'FOLLOW_UPS' && ['dashboard', 'follow-ups', 'settings'].includes(curr.key)) ||
      (accessLevel === 'LEADS' && ['dashboard', 'leads', 'settings'].includes(curr.key))
    ) {
      acc.push(
        <NavItem
          key={key}
          pathname={pathname}
          {...item}
          isOpen={openDropdown === key}
          onToggle={() => toggleDropdown(key)}
          onClose={onClose}
        />
      );
    }

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title, children, isOpen, onToggle, onClose }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <>
      <li>
        <Box
          component={href ? (external ? 'a' : RouterLink) : 'div'}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noreferrer' : undefined}
          onClick={children ? (e: any) => { e.preventDefault(); onToggle(); } : onClose}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 10px',
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
            },
          }}
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
      </li>

      {/* Render dropdown children */}
      <div
        style={{
          maxHeight: isOpen ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          marginLeft: '20px',
        }}
      >
        {isOpen && children && (
          <ul style={{ paddingLeft: '0', marginTop: '5px', listStyle: 'none' }}>
            {children.map((child) => (
              <li key={child.key}>
                <Box
                  component={RouterLink}
                  href={child.href as string}
                  onClick={onClose}
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
          </ul>
        )}
      </div>
    </>
  );
}
