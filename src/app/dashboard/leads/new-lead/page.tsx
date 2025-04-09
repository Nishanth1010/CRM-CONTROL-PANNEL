import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

import { config } from '@/config';
import NewLead from '@/components/dashboard/leads/new-leads';

export const metadata = { title: `New Leads | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}} >
        <NewLead />
    </Stack>
  );
}
