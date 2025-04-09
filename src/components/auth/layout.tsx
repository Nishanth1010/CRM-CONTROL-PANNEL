import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: { xs: 'flex', lg: 'grid' },
        flexDirection: 'column',
        gridTemplateColumns: '1fr 1fr',
        minHeight: '100%',
      }}
    >
      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
        <Box sx={{ p: 3 }}>
          <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
            <DynamicLogo colorDark="light" colorLight="dark" height={50} width={190} />
          </Box>
        </Box>
        <Box sx={{ alignItems: 'center', display: 'flex', flex: '1 1 auto', justifyContent: 'center', p: 3 }}>
          <Box sx={{ maxWidth: '450px', width: '100%' }}>{children}</Box>
        </Box>
      </Box>

      {/* Welcome Panel */}
      <Box
        sx={{
          alignItems: 'center',
          background: 'radial-gradient(circle at center, #E3F2FD 0%, #FFFFFF 70%)',
          color: '#0D47A1',            // Darker blue text color for better contrast
          display: { xs: 'none', lg: 'flex' },
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography color="inherit" sx={{ fontSize: '28px', lineHeight: '36px', textAlign: 'center' }} variant="h1">
              Welcome to{' '}
              <Box component="span" sx={{ color: '#1976D2' }}>
                XY-CRM
              </Box>
            </Typography>
            <Typography align="center" variant="subtitle1" sx={{ color: '#1A237E' }}>
              A modern CRM platform to manage leads, track interactions, and boost sales.
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              component="img"
              alt="CRM Dashboard Illustration"
              src="/assets/bg-crm.png" // Suggested new image path for a CRM dashboard
              sx={{ height: 'auto', width: '100%', maxWidth: '550px', borderRadius: '8px' }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
