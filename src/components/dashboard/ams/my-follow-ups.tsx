'use client';

import React, { useEffect, useState } from 'react';
import { ErrorOutline, Search } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Button,
  ButtonGroup,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import debounce from 'lodash/debounce';
import { CheckCircle } from '@phosphor-icons/react';

interface AMS {
  id: string;
  customer: { customerName: string };
  customerId?: string;
  employeeId?: string;
  product: { name: string };
  productId?: string;
  employee: { name: string };
  visitDate: string;
  assignedTo: string;
  status: string;
}

const ListAMS: React.FC = () => {
  const [amsList, setAMSList] = useState<AMS[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedAMS, setSelectedAMS] = useState<AMS | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);


  const companyId = localStorage.getItem('companyId') || 'defaultCompany';

  const fetchAMSList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/${companyId}/ams`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery?.trim() || '',
          today: new Date(),
          status: "PENDING"
        },
      });

      setAMSList(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch (error) {
      setError('Failed to fetch AMS orders. Please try again later.');
      console.error('Error fetching AMS orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAMSList();
  }, [page, rowsPerPage, searchQuery]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
    setPage(0);
  }, 300);

  const handleEditClick = (ams: AMS) => {
    setSelectedAMS(ams);
    setConfirmationOpen(true);
  };

  const handleConfirmVisited = async () => {
    if (!selectedAMS) return;

    setLoading(true);
    try {
      await axios.put(`/api/${companyId}/ams?id=${selectedAMS.id}`, {
        status: 'COMPLETED',
      });
      fetchAMSList();
      setConfirmationOpen(false);
    } catch (error) {
      setError('Failed to update AMS order. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Paper elevation={4} sx={{ p: 3, maxWidth: '95%', margin: '20px auto', borderRadius: '15px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          AMS Follow up Reminders
        </Typography>
        <TextField
          label="Search AMS Orders"
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 500, borderRadius: 2, overflow: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>AMS Order No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Visit Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : amsList.length > 0 ? (
              amsList.map((ams) => (
                <TableRow key={ams.id} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell>AMS-{ams.id}</TableCell>
                  <TableCell>{ams.customer?.customerName || 'N/A'}</TableCell>
                  <TableCell>{ams.product?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(ams.visitDate).toLocaleDateString()}</TableCell>
                  <TableCell>{ams.employee?.name || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <ButtonGroup>
                      <Button
                        startIcon={<CheckCircle />}
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditClick(ams)}
                      >
                        Mark as Visited
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                    <ErrorOutline color="disabled" fontSize="large" />
                    <Typography variant="body1" color="textSecondary">
                      No AMS orders found.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
        <TablePagination
          count={totalRecords}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Box>

      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Confirm Mark as Visited</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this AMS order as <strong>visited</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmVisited} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ListAMS;