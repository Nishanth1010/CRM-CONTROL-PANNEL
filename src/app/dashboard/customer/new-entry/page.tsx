import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import CreateCustomerForm from '@/components/dashboard/customers/new-customer';

export const metadata: Metadata = {
  title: `New Customer | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -10}}>
   
      <Box>
        {/* Render the FollowupList component */}
        <CreateCustomerForm />
      </Box>
    </Stack>
  );
}
