import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const [userName, setUserName] = React.useState<string>('');
  const [userRole, setUserRole] = React.useState<string>('');
  const [companyName, setCompanyName] = React.useState<string>('');
  const [team, setTeam] = React.useState<string>('');

  const { checkSession } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    // Retrieve user information from localStorage
    const storedUserName = localStorage.getItem('name');
    const storedUserRole = localStorage.getItem('role');
    const storedCompanyName = localStorage.getItem('companyName');
    const accessLevel = localStorage.getItem('access');
    const profileImg = localStorage.getItem('profileImg');


    setUserName(storedUserName || ''); 
    setUserRole(storedUserRole === 'admin' ? 'Admin' : 'Employee');
    setCompanyName(storedCompanyName || '');

    // Determine team based on access level
    if (accessLevel == 'ALL_ACCESS') {
      setTeam('Admin');
    } else if (accessLevel == 'LEADS') {
      setTeam('Lead Management');
    } else if (accessLevel == 'FOLLOW-UPS') {
      setTeam('Follow Ups Management');
    } else if (accessLevel == 'Admin') {
      setTeam('Lead and Follow up Management');
    } else {
      setTeam('Unknown');
    }
  }, []);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router and we need to do it manually
      router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [checkSession, router]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{userName}</Typography>
    
        
        <Typography color="text.secondary" variant="body2" sx={{ fontSize: 14 }}>
          <Box component="span" sx={{ fontWeight: 600 }}>Company:</Box> {companyName}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Settings
        </MenuItem>
       
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
