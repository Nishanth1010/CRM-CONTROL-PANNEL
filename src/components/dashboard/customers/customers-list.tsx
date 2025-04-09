"use client";

import React, { useEffect, useState } from 'react';
import { Delete, Edit, Search, Warning, Visibility, WarningAmber, Close } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  MenuItem,
} from '@mui/material';
import axios from 'axios';

import EditCustomerModal from './customer-edit-modal';


interface Customer {
  id: string;
  customerName: string;
  categoryId?: string;
  category?: Category;  // ✅ Correct type reference
  email: string;
  address: string;
  stateDistrictPin: string;
  gstNumber: string;
  cinNumber: string;
  businessLegalName: string;
  authorizedPersonName: string;
  mobileNumber: string;
  whatsappNumber: string;
}


interface Category {
  id: string;
  categoryName: string;
}


const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null); // ✅ Correct type

  const [meta, setMeta] = useState({
    totalCount: 0,
    currentPage: 1,
    pageSize: 5,
    totalPages: 1,
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; customerId: string | null }>({
    open: false,
    customerId: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  const fetchCustomers = async (currentPage: number, pageSize: number) => {
    setLoading(true);
    try {
      if (companyId) {
        const response = await axios.get(`/api/${companyId}/customers`, {
          params: {
            page: currentPage,
            pageSize,
            search,
            category,
          },
        });
        setCustomers(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      if (companyId) {
        const response = await axios.get(`/api/${companyId}/category`);
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);  // ✅ Corrected error message
    }
  };


  useEffect(() => {
    if (companyId) {
      fetchCustomers(meta.currentPage, meta.pageSize);
    }
  }, [companyId, meta.currentPage, meta.pageSize, category ,search ]); // ✅ Triggers only when required

  useEffect(() => {
    if (companyId) {
      fetchCategories();
    }
  }, [companyId]); // ✅ Triggers only when the company ID changes


  const handleDelete = async () => {
    if (!deleteDialog.customerId || !companyId) return;

    try {
      await axios.delete(`/api/${companyId}/customers`, {
        params: { id: deleteDialog.customerId },
      });
      setCustomers((prev) => prev.filter((customer) => customer.id !== deleteDialog.customerId));
      setSnackbar({ open: true, message: 'Customer deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to delete customer:', error);
      setSnackbar({ open: true, message: 'Failed to delete customer.', severity: 'error' });
    } finally {
      setDeleteDialog({ open: false, customerId: null });
    }
  };

  const handleEdit = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === updatedCustomer.id
          ? {
              ...updatedCustomer,
              category: updatedCustomer.category, // Ensure the category is updated
            }
          : c
      )
    );
    setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
    setEditCustomer(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    setMeta((prev) => ({ ...prev, currentPage: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setMeta((prev) => ({ ...prev, currentPage: 1, pageSize: newPageSize }));
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        {Array.from({ length: 5 }).map((_, cellIndex) => (
          <TableCell key={cellIndex}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 2 }}>
        <Typography variant="h4">Customer List</Typography>
        <Stack direction="row" alignItems="center" gap={2}>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ marginRight: 1, color: 'rgba(0, 0, 0, 0.54)' }} />,
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            label="Category"
            select
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="small"
          >
            <MenuItem value="">Select Category</MenuItem>
            {categories &&
              categories.map((cat: Category) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </MenuItem>
              ))}
          </TextField>


        </Stack>

      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}> Customer Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? renderSkeletonRows()
              : customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                    '&:hover': { backgroundColor: '#f1f1f1' },
                  }}
                >
                  <TableCell>{customer.customerName}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.category?.categoryName || "NA"}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.mobileNumber}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <ButtonGroup>
                      <Tooltip title="View">
                        <Button
                          color="info"
                          variant="outlined"
                          onClick={() => setViewCustomer(customer)}
                          startIcon={<Visibility />}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#0288d1',
                            color: '#0288d1',
                            '&:hover': {
                              backgroundColor: '#e1f5fe',
                              borderColor: '#01579b',
                            },
                          }}
                        >
                         
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button
                          color="primary"
                          variant="outlined"
                          onClick={() => setEditCustomer(customer)}
                          startIcon={<Edit />}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#1976d2',
                            color: '#1976d2',
                            '&:hover': {
                              backgroundColor: '#e3f2fd',
                              borderColor: '#1565c0',
                            },
                          }}
                        >
                        
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => setDeleteDialog({ open: true, customerId: customer.id })}
                          startIcon={<Delete />}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#d32f2f',
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: '#ffebee',
                              borderColor: '#b71c1c',
                            },
                          }}
                        >
                         
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={meta.totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, customerId: null })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        {/* Warning Header with Icon & Close Button */}
        <DialogTitle
          id="delete-dialog-title"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#ffe6e6", // Light red background
            color: "#d32f2f",
            fontWeight: "bold",
            padding: "16px 24px",
            borderTop: "4px solid #d32f2f",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <WarningAmber style={{ color: "#d32f2f" }} /> Confirm Deletion
          </div>
          <IconButton onClick={() => setDeleteDialog({ open: false, customerId: null })} size="small">
            <Close style={{ color: "#d32f2f" }} />
          </IconButton>
        </DialogTitle>

        {/* Warning Message */}
        <DialogContent style={{ padding: "24px" }}>
          <DialogContentText
            id="delete-dialog-description"
            style={{
              textAlign: "left",
              fontSize: "16px",
              lineHeight: "1.5",
              color: "#333",
            }}
          >
            <strong style={{ color: "#d32f2f" }}>Warning:</strong> Deleting this customer will also delete:
            <ul style={{ marginTop: "10px", marginBottom: "10px", paddingLeft: "20px" }}>
              <li><strong>All associated Deals</strong></li>
              <li><strong>All AMS records</strong></li>
            </ul>
            <strong style={{ color: "#000" }}>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>

        {/* Buttons */}
        <DialogActions style={{ justifyContent: "space-between", padding: "16px 24px" }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, customerId: null })}
            variant="outlined"
            color="primary"
            style={{ padding: "8px 16px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            style={{
              padding: "10px 20px",
              fontWeight: "bold",
              backgroundColor: "#d32f2f",
            }}
          >
            <WarningAmber style={{ marginRight: "8px" }} /> Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Customer Modal */}
      {viewCustomer && (
        <Dialog open={!!viewCustomer} onClose={() => setViewCustomer(null)}>
          <DialogTitle>
            <Typography variant="h5" component="div" align="center" gutterBottom sx={{ color: '#3f51b5' }}>
              Customer Details
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Card sx={{ marginBottom: 2, padding: 2, boxShadow: 5, borderRadius: 3, backgroundColor: '#f5f5f5' }}>
              <CardContent>
                <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Name</TableCell>
                        <TableCell>{viewCustomer.customerName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Email</TableCell>
                        <TableCell>{viewCustomer.email}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Category</TableCell>
                        <TableCell>{viewCustomer.category?.categoryName || "NA"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Address</TableCell>
                        <TableCell>{viewCustomer.address}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Mobile</TableCell>
                        <TableCell>{viewCustomer.mobileNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> WhatsApp</TableCell>
                        <TableCell>{viewCustomer.whatsappNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> GST Number</TableCell>
                        <TableCell>{viewCustomer.gstNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> CIN Number</TableCell>
                        <TableCell>{viewCustomer.cinNumber}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}> Legal Name</TableCell>
                        <TableCell>{viewCustomer.businessLegalName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Authorized Person</TableCell>
                        <TableCell>{viewCustomer.authorizedPersonName}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewCustomer(null)} color="primary" variant="contained" sx={{ margin: "0 auto", display: "block", backgroundColor: '#3f51b5', color: '#fff', '&:hover': { backgroundColor: '#303f9f' } }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}


      {/* Edit Modal */}
      {editCustomer && (
        <EditCustomerModal
          customer={editCustomer}
          onClose={() => setEditCustomer(null)}
          companyId={companyId}
          onUpdate={handleEdit}
        />
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CustomerList;
