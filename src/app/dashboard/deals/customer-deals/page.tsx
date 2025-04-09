import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import CustomerDeals from '@/components/dashboard/deals/customer-deals';

export const metadata: Metadata = {
  title: `Customer Deals | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <CustomerDeals />
      </Box>
    </Stack>
  );
}
