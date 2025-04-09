import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';

import { config } from '@/config';
import CategoryTab from '@/components/dashboard/account/customer-category';

export const metadata = { title: `Customer Category | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
       
          <CategoryTab />
     
    </Stack>
  );
}
