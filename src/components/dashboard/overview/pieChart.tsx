// components/dashboard/overview/PieChart.tsx

"use client";

import * as React from 'react';
import axios from 'axios';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Traffic } from '@/components/dashboard/overview/traffic';

interface PieChartProps {
  companyId: number | null;
}

const PieChart: React.FC<PieChartProps> = ({ companyId }) => {
  const [chartData, setChartData] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (companyId) fetchPieChartData();
  }, [companyId]);

  async function fetchPieChartData() {
    setLoading(true);
    try {
      const response = await axios.get(`/api/${companyId}/pie-chart`);
      if (response.data.success) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    } finally {
      setLoading(false);
    }
  }

  const hasNoData = chartData.every((value) => value === 0);

  return (
    <Grid lg={4} md={6} xs={12}>
      {loading ? (
        <Skeleton variant="circular" width={200} height={200} />
      ) : hasNoData ? (
        <Typography variant="body2" color="textSecondary" align="center">
          No data available for this chart.
        </Typography>
      ) : (
        <Traffic
          chartSeries={chartData}
          labels={['New Leads', 'Contacted Leads', 'Customer']}
          sx={{ height: '100%' }}
        />
      )}
    </Grid>
  );
};

export default PieChart;
