import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import CustomerList from '@/components/dashboard/customers/customers-list';

export const metadata: Metadata = {
  title: `Customer List | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        {/* Render the FollowupList component */}
        <CustomerList />
      </Box>
    </Stack>
  );
}
