'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, Box, IconButton, Stack } from '@mui/material';
import { List as ListIcon } from '@phosphor-icons/react';
import axios from 'axios';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const userPopover = usePopover<HTMLDivElement>();
  const { change } = useUser();
  
  // Define state for user data
  const [userName, setUserName] = useState<string>('');
  const [bniId, setBniId] = useState<string>('');
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [openNav, setOpenNav] = useState<boolean>(false);

  // Fetch user data and localStorage values after the component mounts
 

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '64px',
            px: 2,
          }}
        >
          {/* Left side with Menu Icon */}
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={() => setOpenNav(true)}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
          </Stack>

          {/* Logo for mobile view */}
          <Box
            sx={{
              display: {
                xs: 'inline-flex',
                sm: 'inline-flex',
                md: 'inline-flex',
                lg: 'none',
                xl: 'none',
              },
            }}
          >
            <Box
              component="img"
              alt="Widgets"
              src="/assets/logo--dark.svg"
              sx={{ height: 'auto', width: '150px' }}
            />
          </Box>

          {/* Right side with Avatar */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={profileImg || '/default-avatar.png'} // Use a default avatar if none is set
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* User Popover */}
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        onClose={() => setOpenNav(false)}
        open={openNav}
      />
    </React.Fragment>
  );
}
