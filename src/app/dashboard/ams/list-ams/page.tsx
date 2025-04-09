import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import ListAMS from '@/components/dashboard/ams/list-ams';
export const metadata: Metadata = {
  title: `List AMS | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <ListAMS />
      </Box>
    </Stack>
  );
}