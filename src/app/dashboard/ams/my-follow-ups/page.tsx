import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import MyFollowUps from '@/components/dashboard/ams/my-follow-ups';
export const metadata: Metadata = {
  title: `MyFollowUps | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        <MyFollowUps />
      </Box>
    </Stack>
  );
}