'use client';
import React, { useEffect, useState } from 'react';
import { Search } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';
import AddCardIcon from '@mui/icons-material/AddCard';

import {
  Button,
  ButtonGroup,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Tooltip,
} from '@mui/material';
import axios from 'axios';
import ConfirmationDialog from './confrom-delete';
import debounce from 'lodash/debounce';
import ShowPaymentsModal from './show-payments-modal';
import AddPaymentModal from './add-payment-modal';
import EditDealModal from './edit-deal'; // Ensure this path is correct
import { authClient } from '@/lib/auth/client';


// Ensure this path is correct
interface Customer {
  id: string;
  customerName: string;
  email: string;
  address: string;
  stateDistrictPin: string;
  gstNumber: string;
  cinNumber: string;
  businessLeadName: string;
  authorizedPersonName: string;
  mobileNumber: string;
  whatsappNumber: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  paymentType: string;
  balanceAmount: number; // Added balanceAmount property
}

interface Deal {
  [x: string]: any;
  id: string;
  dealID: string;
  customer: Customer;
  requirement: string;
  dealValue: number;
  dealApprovalValue: number;
  advancePayment: number;
  balanceAmount: number;
  createdAt: string;
  balance: number; // Added balance property
  payments: Payment[]; // Added payments property
  initialBalance: number; // Added initial balance property
};

type Order = 'asc' | 'desc';

const DealListTable: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Deal>('dealID');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentsModalOpen, setShowPaymentsModalOpen] = useState(false); // For Show Payments
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false); // For Add Payment
  const [loadingPayments, setLoadingPayments] = useState(false);



  const companyId = localStorage.getItem('companyId') || 'defaultCompany';

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`/api/${companyId}/deals`, {
        params: { page, rowsPerPage, search: searchQuery, order, orderBy },
      });
      setDeals(data.deals || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (err) {
      setError('Failed to fetch deals. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [page, rowsPerPage, searchQuery, order, orderBy]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page on search
  }, 300);

  const handleEditClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedDeal: Deal) => {
    setLoading(true);
    try {
      await axios.put(`/api/${companyId}/deals`, updatedDeal);
      fetchDeals();
      setEditModalOpen(false);
    } catch (err) {
      setError('Failed to save deal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const [successMessage, setSuccessMessage] = useState<string | null>(null);




  const handleDeleteClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      if (selectedDeal) {

        await axios.delete(`/api/${companyId}/deals`, { data: { id: selectedDeal.id } });

        fetchDeals(); // Refresh the list after deletion
      }
      setDeleteDialogOpen(false);
      setSuccessMessage('Deal deleted successfully.');
      fetchDeals();
    } catch (err) {
      setError('Failed to delete deal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleShowPayments = async (deal: Deal) => {
    setLoadingPayments(true);
    setError(null);
    try {
      const { data } = await axios.get(`/api/${companyId}/deals/payments`, {
        params: { dealId: deal.id },
      });

      setSelectedDeal({
        ...deal,
        balance: data.balance || 0,
        payments: data.payments || [],
      });
      setShowPaymentsModalOpen(true);
    } catch (err) {
      setError('Failed to fetch payments. Please try again.');
      console.error(err);
    } finally {
      setLoadingPayments(false);
    }
  };


  const handleAddPayment = (deal: Deal) => {
    setSelectedDeal(deal);
    setAddPaymentModalOpen(true);
  };

  const handleSavePayment = async (payment: { amount: number; date: string; paymentType: string }) => {
    setLoading(true);
    
    try {
      if (!selectedDeal) {
        setError('No deal selected. Please try again.');
        return;
      }

      // Calculate the new balanceAmount
      const updatedBalanceAmount = selectedDeal.balanceAmount - payment.amount;

      // Save the payment
      const res =  await axios.post(`/api/${companyId}/deals/payments`, {
        dealId: selectedDeal.id,
        amount: payment.amount,
        paymentDate: payment.date,
        paymentType: payment.paymentType,
        remarks: '',
        createdById: (await authClient.getUser()).data?.id || null,
      });


      console.log(res.data); // Log the response data for debugging
      // Update the deal's balanceAmount
      const updatedDeal = { ...selectedDeal, balanceAmount: updatedBalanceAmount };
      setSelectedDeal(updatedDeal);

      // Refresh the deals list
      fetchDeals();
      setAddPaymentModalOpen(false);
    } catch (err) {
      setError('Failed to save payment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setEditOpen = (isOpen: boolean) => {
    setEditModalOpen(isOpen);
  };

  return (
    <Paper elevation={4} sx={{ p: 3, maxWidth: '95%', margin: '20px auto', borderRadius: '15px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Deal List
        </Typography>
        <TextField
          label="Search Deals"
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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'dealID'}
                  direction={orderBy === 'dealID' ? order : 'asc'}
                  onClick={() => setOrderBy('dealID')}
                >
                  Deal ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ textWrap: "nowrap" }}>Customer Name</TableCell>
              <TableCell sx={{ textWrap: "nowrap" }}>Deal Value (₹)</TableCell>
              <TableCell sx={{ textWrap: "nowrap" }}>Deal Approved Value (₹)</TableCell>
              <TableCell sx={{ textWrap: "nowrap" }}>Balance Amount (₹)</TableCell>
              <TableCell sx={{ textAlign: "nowrap" }}>Payments</TableCell>
              <TableCell sx={{ textAlign: "nowrap" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton variant="rectangular" height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : deals.length > 0 ? (
              deals.map((deal) => (
                <TableRow
                  key={deal.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <TableCell>{deal.dealID}</TableCell>
                  <TableCell>{deal.customer.customerName}</TableCell>
                  <TableCell>{deal.dealValue.toFixed(2)} ₹</TableCell>
                  <TableCell>{deal.dealApprovalValue.toFixed(2)} ₹</TableCell>
                  <TableCell>{deal.balanceAmount.toFixed(2)} ₹</TableCell>

                  <TableCell>
                    <ButtonGroup>
                      <Tooltip title="View Payments">
                        <Button
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleShowPayments(deal)}
                          sx={{ color: 'primary.main' }}
                        />
                      </Tooltip>
                      <Tooltip title="Add Payment">
                        <Button
                          startIcon={<AddCardIcon />}
                          onClick={() => handleAddPayment(deal)}
                          sx={{ color: 'success.main' }}
                        />
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                  <TableCell>
                    <ButtonGroup>

                      <Tooltip title="Delete Deal">
                        <Button
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(deal)}
                          sx={{ color: 'error.main' }}
                        />
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography align="center" variant="body1" color="textSecondary">
                    No deals found.
                  </Typography>
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
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Box>


      <EditDealModal
        open={editModalOpen}
        deal={selectedDeal}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}


      />
      <ShowPaymentsModal
        open={showPaymentsModalOpen}
        initialBalance={selectedDeal?.balanceAmount ?? 0}
        payments={selectedDeal?.payments || []}
        loading={loadingPayments} // Pass the new loading state
        onClose={() => setShowPaymentsModalOpen(false)}
        deal={selectedDeal}
      />



      <AddPaymentModal
        open={addPaymentModalOpen}
        deal={selectedDeal}
        onClose={() => setAddPaymentModalOpen(false)}
        onSave={handleSavePayment}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this deal?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Paper>
  );
};

export default DealListTable;
