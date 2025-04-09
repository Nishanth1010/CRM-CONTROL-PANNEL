import * as React from 'react';
import type { Metadata } from 'next';
import { Stack, Typography, Box } from '@mui/material';
import { config } from '@/config';
import FollowupList from '@/components/dashboard/follow-ups/follow-ups'; // Assuming FollowupList is the correct path

export const metadata: Metadata = {
  title: `Follow Ups | Dashboard | ${config.site.name}`,
};

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{marginTop : -5}}>
   
      <Box>
        {/* Render the FollowupList component */}
        <FollowupList />
      </Box>
    </Stack>
  );
}
