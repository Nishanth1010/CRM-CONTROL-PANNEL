import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import DealListTable from '@/components/dashboard/deals/deal-list';

export const metadata: Metadata = {
  title: `Deal List | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <DealListTable />
      </Box>
    </Stack>
  );
}
