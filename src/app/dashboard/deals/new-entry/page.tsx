import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import DealCreateForm from '@/components/dashboard/deals/new-deals';

export const metadata: Metadata = {
  title: `New Deals | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <DealCreateForm />
      </Box>
    </Stack>
  );
}
