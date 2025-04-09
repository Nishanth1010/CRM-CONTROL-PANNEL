"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import type { ApexOptions } from 'apexcharts';

import { Chart } from '@/components/core/chart';

export interface TrafficProps {
  chartSeries: number[];
  labels: string[];
  sx?: SxProps;
}

export function Traffic({ chartSeries, labels, sx }: TrafficProps): React.JSX.Element {
  const theme = useTheme();
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={{ ...sx, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2, boxShadow: 3 }}>
      <CardContent sx={{ flex: 1 }}>
        <CardHeader title="Traffic Source" sx={{ paddingBottom: 2 }} />

         {/* Chart positioned on the right */}
      <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Chart height={600} options={chartOptions} series={chartSeries} type="donut" width="100%" />
      </CardContent>
      
        <Stack spacing={2} sx={{display : 'flex' , flexDirection : 'row'}}>
          {chartSeries.map((item, index) => (
            <Stack key={labels[index]} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              {/* Color indicator for each label */}
              <CircleIcon sx={{ color: chartOptions.colors?.[index], fontSize: 14 }} />
              <Stack>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{labels[index]}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {item}%
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>

     
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      dropShadow: { enabled: true, top: 1, left: 1, blur: 4, color: theme.palette.grey[500], opacity: 0.3 },
    },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false, donut: { size: '70%' } } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 1, colors: ['#fff'] },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
