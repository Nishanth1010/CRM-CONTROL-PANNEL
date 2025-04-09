import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import MyFollowUpList from '@/components/dashboard/follow-ups/my-follow-ups';

export const metadata: Metadata = {
  title: `Today Follow Ups | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
      
      <Box>
        {/* Render the FollowupList component */}
        <MyFollowUpList />
      </Box>
    </Stack>
  );
}
