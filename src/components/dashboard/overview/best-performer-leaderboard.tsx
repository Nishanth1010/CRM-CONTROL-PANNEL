import React, { useState } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

interface BestPerformerEntry {
  rank: number;
  name: string;
  totalLeads: number;
  inProgress: number;
  customer: number;
  rejected: number;
}

interface Props {
  performers: BestPerformerEntry[];
  onDateChange: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
  loading: boolean;
}

export default function BestPerformerLeaderboard({ performers, onDateChange, loading }: Props) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [companyId, setCompanyId] = React.useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    const storedCompanyId = localStorage.getItem("companyId");
    if (storedCompanyId) setCompanyId(Number(storedCompanyId));
  }, []);

  const renderRank = (rank: number) => {
    switch (rank) {
      case 1:
        return <Star sx={{ color: '#FFD700' }} />;
      case 2:
        return <StarHalf sx={{ color: '#C0C0C0' }} />;
      case 3:
        return <StarBorder sx={{ color: '#CD7F32' }} />;
      default:
        return rank;
    }
  };

  const handleDateChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDate(start);
    setEndDate(end);
    onDateChange(start, end);
  };

  const resetDates = () => {
    setStartDate(null);
    setEndDate(null);
    onDateChange(null, null);
  };

  const handleDownloadReport = async () => {
    try {
      if (!startDate || !endDate) {
        setSnackbar({ open: true, message: 'Please select a start date and an end date.', severity: 'error' });
        return;
      }

      const response = await axios.get(
        `/api/${companyId}/follow-up-report`,
        {
          params: {
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
          },
          responseType: 'blob', // Ensure the response is treated as a file
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FollowUpReport.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSnackbar({ open: true, message: 'Report downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error downloading report:', error);
      setSnackbar({ open: true, message: 'Failed to download the report. Please try again later.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Card sx={{ boxShadow: 3, padding: 2, borderRadius: '10px' }}>
      <CardHeader
        title="Best Performers"
        titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      />
      <CardContent>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ marginBottom: '1.5rem' }}
        >
          <Stack spacing={2} direction="row" alignItems="center">
            <DatePicker
              label="Start Date"
              value={startDate}
              format="DD MM YYYY"
              onChange={(newValue) => handleDateChange(newValue, endDate)}
              sx={{ width: 200 }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              format="DD MM YYYY"
              onChange={(newValue) => handleDateChange(startDate, newValue)}
              sx={{ width: 200 }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="secondary" onClick={resetDates}>
              Reset Dates
            </Button>
            <Button variant="contained" onClick={handleDownloadReport}>
              Follow-up Report
            </Button>
          </Stack>
        </Stack>
        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none', borderRadius: '10px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Employee Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">
                  Total Leads Assigned
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">
                  Total In Progress
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">
                  Total Customer
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">
                  Total Rejected
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell>
                    <Skeleton variant="text" width={40} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" width={60} />
                  </TableCell>
                </TableRow>
              ) : (
                performers.map((performer) => (
                  <TableRow key={performer.rank}>
                    <TableCell>{renderRank(performer.rank)}</TableCell>
                    <TableCell>{performer.name}</TableCell>
                    <TableCell align="right">{performer.totalLeads}</TableCell>
                    <TableCell align="right">{performer.inProgress}</TableCell>
                    <TableCell align="right">{performer.customer}</TableCell>
                    <TableCell align="right">{performer.rejected}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity as 'success' | 'error'}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}
