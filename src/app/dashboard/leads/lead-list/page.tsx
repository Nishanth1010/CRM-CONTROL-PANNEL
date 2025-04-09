import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import LeadList from '@/components/dashboard/leads/lead-list';

export const metadata: Metadata = {
  title: `Lead List | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
      <Box>
      <LeadList />
      </Box>
    </Stack>
  );
}
