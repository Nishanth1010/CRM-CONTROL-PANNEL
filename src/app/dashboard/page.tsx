// components/dashboard/Page.tsx

"use client";

import * as React from 'react';
import axios from 'axios';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import StatusCards from '@/components/dashboard/overview/statCards';
import { FollowupsLeaderboard } from '@/components/dashboard/overview/leaderborad';
import BestPerformerLeaderboard from '@/components/dashboard/overview/best-performer-leaderboard';
import dayjs, { Dayjs } from 'dayjs';

interface BestPerformerEntry {
  rank: number;
  name: string;
  totalLeads: number;
  inProgress: number;
  customer: number;
  rejected: number;
}

export default function Page(): React.JSX.Element {
  const [bestPerformers, setBestPerformers] = React.useState<BestPerformerEntry[]>([]);
  const [followupLeaders, setFollowupLeaders] = React.useState<BestPerformerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [companyId, setCompanyId] = React.useState<number | null>(null);
  const [dateRange, setDateRange] = React.useState<{ startDate: Dayjs | null; endDate: Dayjs | null }>({
    startDate: null,
    endDate: null,
  });

  React.useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) setCompanyId(Number(storedCompanyId));
  }, []);

  React.useEffect(() => {
    if (companyId !== null) {
      fetchLeaderboards();
    }
  }, [companyId, dateRange]); // Add dateRange to dependencies to refetch data on date change

  async function fetchLeaderboards() {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;
      const params = {
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
      };

      const leaderboardRes = await axios.get(`/api/${companyId}/leaderboard`, { params });
      
      if (leaderboardRes.data.success) {
        setBestPerformers(leaderboardRes.data.data.bestPerformers);
        setFollowupLeaders(leaderboardRes.data.data.followupLeaders);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDateChange = (startDate: Dayjs | null, endDate: Dayjs | null) => {
    setDateRange({ startDate, endDate });
  };

  return (
    <Grid container spacing={3}>
      {/* Status Cards */}
      <StatusCards />

      {/* Leaderboards */}
      <Grid>
          <BestPerformerLeaderboard performers={bestPerformers} onDateChange={handleDateChange} loading={loading} />
      </Grid>
      {/* <Grid lg={6} xs={12}>
        {loading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <FollowupsLeaderboard leaders={followupLeaders} />
        )}
      </Grid> */}
    </Grid>
  );
}
