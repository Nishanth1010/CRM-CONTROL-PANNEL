
import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import CreateAMS from '@/components/dashboard/ams/create-ams';


export const metadata: Metadata = {
  title: `Create AMS | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <CreateAMS />
      </Box>
    </Stack>
  );
}
