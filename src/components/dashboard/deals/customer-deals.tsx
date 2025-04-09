'use client';

import React, { useEffect, useState } from 'react';
import { Close, Search } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import axios from 'axios';

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
  totalDealValue?: number;
  totalBalanceAmount?: number;
}

interface Deal {
  id: string;
  dealID: string;
  requirement: string;
  dealValue: number;
  dealApprovalValue: number;
  advancePayment: number;
  balanceAmount: number;
}

const CustomerDeals = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDeals, setLoadingDeals] = useState<boolean>(false);
  const [meta, setMeta] = useState({
    totalCount: 0,
    currentPage: 1,
    pageSize: 5,
    totalPages: 1,
  });

  const [companyId, setCompanyId] = useState<string | null>(null);

  // Calculate totals for selected customer
  const totalDealValue = deals.reduce((sum, deal) => sum + deal.dealValue, 0);
  const totalBalanceAmount = deals.reduce((sum, deal) => sum + deal.balanceAmount, 0);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    setCompanyId(storedCompanyId);
  }, []);

  const fetchCustomers = async (page: number, pageSize: number, query: string = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/${companyId}/dealcustomer`, {
        params: { page, pageSize, search: query },
      });
      const enrichedCustomers = response.data.data.map((cust: Customer) => ({
        ...cust,
        totalDealValue: cust.totalDealValue || 0,
        totalBalanceAmount: cust.totalBalanceAmount || 0,
      }));
      setCustomers(enrichedCustomers);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCustomers(meta.currentPage, meta.pageSize, search);
    }
  }, [companyId, meta.currentPage, meta.pageSize, search]);

  const fetchCustomerDeals = async (customerId: string) => {
    setLoadingDeals(true);
    try {
      const response = await axios.get(`/api/${companyId}/dealcustomer/deals`, {
        params: { customerId },
      });
      setDeals(response.data.deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchCustomers(newPage + 1, meta.pageSize, search);
    setMeta((prev) => ({ ...prev, currentPage: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    fetchCustomers(1, newPageSize, search);
    setMeta((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }));
  };

  const handleShowDeals = (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchCustomerDeals(customer.id);
  };

  const handleCloseDeals = () => {
    setSelectedCustomer(null);
    setDeals([]);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Customer Deals
        </Typography>
        <TextField
          placeholder="Search customers"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ maxWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ marginRight: 1, color: 'rgba(0, 0, 0, 0.54)' }} />,
          }}
          value={search}
          onChange={handleSearch}
        />
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : customers.length === 0 ? (
        <Typography variant="h6" align="center" color="textSecondary">
          No customers found.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Mobile number</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Deal Value</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Balance</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Show Deals</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer, index) => (
                  <TableRow
                    key={customer.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      '&:hover': { backgroundColor: '#f1f1f1' },
                    }}
                  >
                    <TableCell>{customer.customerName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.mobileNumber}</TableCell>
                    <TableCell>{`₹${customer.totalDealValue?.toLocaleString()}`}</TableCell>
                    <TableCell>{`₹${customer.totalBalanceAmount?.toLocaleString()}`}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => handleShowDeals(customer)}
                        sx={{ textTransform: 'none' }}
                      >
                        Show Deals
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={meta.totalCount}
            page={meta.currentPage - 1} // Adjust for 0-based index
            onPageChange={handleChangePage}
            rowsPerPage={meta.pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {/* Deals Modal */}
      {selectedCustomer && (
       <Dialog
       open={!!selectedCustomer}
       onClose={handleCloseDeals}
       maxWidth="sm"
       fullWidth
       sx={{
         '& .MuiDialog-paper': {
           borderRadius: 4,
           boxShadow: 5,
           transition: 'all 0.3s ease-in-out',
         },
       }}
     >
       {/* Dialog Header */}
       <DialogTitle
         sx={{
           backgroundColor: '#f7f7f7',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           paddingY: 2,
           paddingX: 3,
         }}
       >
         <Typography variant="h6" fontWeight="bold" color="primary">
           Deals for {selectedCustomer?.customerName || ''}
         </Typography>
         <IconButton onClick={handleCloseDeals} sx={{ color: 'grey.600' }}>
           <Close />
         </IconButton>
       </DialogTitle>
       <Divider />
 
       {/* Dialog Content */}
       <DialogContent sx={{ padding: 3 }}>
         {/* Summary Cards */}
         <Box display="flex" justifyContent="space-between" mb={3}>
           <Paper elevation={2} sx={{ padding: 2, flex: 1, marginRight: 1, backgroundColor: '#e8f5e9' }}>
             <Typography variant="subtitle2" color="textSecondary">
               Total Deal Value
             </Typography>
             <Typography variant="h5" fontWeight="bold">
               ₹{totalDealValue.toLocaleString()}
             </Typography>
           </Paper>
           <Paper elevation={2} sx={{ padding: 2, flex: 1, marginLeft: 1, backgroundColor: '#ffebee' }}>
             <Typography variant="subtitle2" color="textSecondary">
               Total Balance Amount
             </Typography>
             <Typography variant="h5" fontWeight="bold">
               ₹{totalBalanceAmount.toLocaleString()}
             </Typography>
           </Paper>
         </Box>

         {loadingDeals ? (
           <Box
             display="flex"
             justifyContent="center"
             alignItems="center"
             sx={{ height: 200 }}
           >
             <CircularProgress />
           </Box>
         ) : deals.length > 0 ? (
          <TableContainer component={Paper} elevation={3} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          {deals.length > 0 ? (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <Tooltip title="Unique Identifier for the Deal" arrow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', color: '#fff' }}>
                      Deal ID
                    </TableCell>
                  </Tooltip>
                  <Tooltip title="Description of Requirement" arrow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', color: '#fff' }}>
                      Requirement
                    </TableCell>
                  </Tooltip>
                  <Tooltip title="Total Value of the Deal" arrow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', color: '#fff' }}>
                      Deal Value
                    </TableCell>
                  </Tooltip>
                  <Tooltip title="Remaining Balance Amount" arrow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#1976d2', color: '#fff' }}>
                      Balance Amount
                    </TableCell>
                  </Tooltip>
                </TableRow>
              </TableHead>
              <TableBody>
                {deals.map((deal, index) => (
                  <TableRow
                    key={deal.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        transition: 'background-color 0.3s ease',
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell>{deal.dealID}</TableCell>
                    <TableCell>{deal.requirement}</TableCell>
                    <TableCell>{`₹${deal.dealValue.toLocaleString()}`}</TableCell>
                    <TableCell>{`₹${deal.balanceAmount.toLocaleString()}`}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography
              variant="h6"
              sx={{ textAlign: 'center', padding: 3, color: '#757575' }}
            >
              No deals available.
            </Typography>
          )}
        </TableContainer>
         ) : (
           <Box
             display="flex"
             flexDirection="column"
             justifyContent="center"
             alignItems="center"
             sx={{ height: 200, textAlign: 'center', color: 'text.secondary' }}
           >
             <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
               No Deals Found
             </Typography>
             <img
               src="https://via.placeholder.com/150" // Replace with an actual illustration URL
               alt="No deals"
               width={100}
               height={100}
               style={{ opacity: 0.8 }}
             />
           </Box>
         )}
       </DialogContent>
 
       {/* Dialog Actions */}
       <DialogActions sx={{ padding: 3, justifyContent: 'flex-end' }}>
         <Button
           variant="outlined"
           color="primary"
           onClick={handleCloseDeals}
           sx={{ textTransform: 'none' }}
         >
           Close
         </Button>
       </DialogActions>
     </Dialog>
      )}
    </Box>
  );
};

export default CustomerDeals;