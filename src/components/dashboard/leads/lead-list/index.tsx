'use client';

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Close, Delete, Edit, ExpandLess, ExpandMore, FilterList, Search, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Grid } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';

import EditLeadModal from './edit-lead-modal';

enum LeadStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CUSTOMER = 'CUSTOMER',
  REJECTED = 'REJECTED',
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  status: LeadStatus;
  priority: string;
  company: { name: string };
  employee: Employee | null;
  products: Product[];
  source: Source | null;
  designation: string;
  place: string;
  description: string;
  nextFollowupDate?: string | Date | null;
}

interface Employee {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface Source {
  id: number;
  source: string;
}

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loadingLeads, setLoadingLeads] = useState<boolean>(true);
  const [errorLeads, setErrorLeads] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);

  // Filter states
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingSources, setLoadingSources] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    const storedRole = localStorage.getItem('role');
    const storedEmployeeId = localStorage.getItem('userId');

    if (storedCompanyId) setCompanyId(Number(storedCompanyId));
    if (storedRole) setRole(storedRole);
    if (storedRole !== 'admin' && storedEmployeeId) {
      setEmployeeId(Number(storedEmployeeId));
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchLeads();
      fetchInitialFilters();
    }
  }, [
    companyId,
    employeeId,
    page,
    rowsPerPage,
    sortBy,
    sortOrder,
    searchQuery,
    statusFilter,
    selectedEmployee,
    selectedProduct,
    selectedSource,
    priorityFilter,
    startDate,
    endDate,
  ]);

  const fetchLeads = () => {
    if (!companyId) return;
  
    setLoadingLeads(true);
  
    const params: any = {
      page: page + 1,
      limit: rowsPerPage,
      search: searchQuery || undefined,
      sortBy,
      sortOrder,
      status: statusFilter || undefined,
      employeeId: selectedEmployee?.id || undefined,
      productId: selectedProduct?.id || undefined,
      sourceId: selectedSource?.id || undefined,
      priority: priorityFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };
  
    Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);
  
    if (role !== 'admin' && employeeId) {
      params.employeeId = employeeId;
    }
  
    axios
      .get(`/api/${companyId}/lead`, { params })
      .then((response) => {
        setLeads(response.data.data);
        setTotalLeads(response.data.total);
        setLoadingLeads(false);
      })
      .catch(() => {
        setErrorLeads('Error fetching leads');
        setLoadingLeads(false);
      });
  };
  

  const fetchInitialFilters = () => {
    if (!companyId) return;

    // Fetch employees
    setLoadingEmployees(true);
    axios
      .get(`/api/${companyId}/employees`)
      .then((response) => {
        setEmployees(response.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingEmployees(false));

    // Fetch products
    setLoadingProducts(true);
    axios
      .get(`/api/${companyId}/products`)
      .then((response) => {
        setProducts(response.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));

    // Fetch sources
    setLoadingSources(true);
    axios
      .get(`/api/${companyId}/sources`)
      .then((response) => {
        setSources(response.data.data);
      })
      .catch(console.error)
      .finally(() => setLoadingSources(false));
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setPage(0);
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSortChange = (property: string) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortBy(property);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const handleEditClick = (lead: Lead) => {
    setEditLead(lead);
    setOpenEditDialog(true);
  };

  const handleViewClick = (lead: Lead) => {
    setViewLead(lead);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;

    setLoadingDelete(true);
    try {
      await axios.delete(`/api/${companyId}/lead/?leadId=${leadToDelete.id}`);
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadToDelete.id));
      setDeleteDialogOpen(false);
      setSuccessMessage('Lead deleted successfully.');
      fetchLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleEditSave = (updatedLead: Lead) => {
    setLeads((prevLeads) => prevLeads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)));
    fetchLeads();
    setOpenEditDialog(false);
    setSuccessMessage('Lead updated successfully.');
  };

  const handleApplyFilters = () => {
    setPage(0);
    fetchLeads();
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedEmployee(null);
    setSelectedProduct(null);
    setSelectedSource(null);
    setStatusFilter(null);
    setPriorityFilter(null);
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  };

  const renderStatusIcon = (status: LeadStatus) => {
    const normalizedStatus = status.trim().toLowerCase() as 'new' | 'in_progress' | 'customer' | 'rejected';
    const colors: { new: string; in_progress: string; customer: string; rejected: string } = {
      new: '#2196F3',
      in_progress: '#F1C604',
      customer: '#4CAF50',
      rejected: '#F44336',
    };

    const initials: { new: string; in_progress: string; customer: string; rejected: string } = {
      new: 'NW',
      in_progress: 'IP',
      customer: 'CU',
      rejected: 'RJ',
    };

    return (
      <Box
        sx={{
          backgroundColor: colors[normalizedStatus] || '#ccc',
          borderRadius: '4px',
          width: '35px',
          height: '35px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {initials[normalizedStatus] || '?'}
        </Typography>
      </Box>
    );
  };

  const renderPriorityIcon = (priority: string) => {
    const normalizedPriority = priority.trim().toLowerCase() as 'low' | 'medium' | 'high';
    const colors: { low: string; medium: string; high: string } = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
    };

    const initials: { low: string; medium: string; high: string } = {
      low: 'L',
      medium: 'M',
      high: 'H',
    };

    return (
      <Box
        sx={{
          backgroundColor: colors[normalizedPriority] || '#ccc',
          borderRadius: '50%',
          width: '35px',
          height: '35px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          {initials[normalizedPriority] || '?'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '1300px', marginX: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          List of Leads
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setIsDrawerOpen(true)}
          sx={{ textTransform: 'none' }}
        >
          Filters
        </Button>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          label="Search all Details"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loadingLeads ? <CircularProgress size={20} /> : <Search />}
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchQuery('')} size="small">
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: '300px' }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Name</strong>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Assigned to</strong>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Phone</strong>
              </TableCell>
              <TableCell
                onClick={() => handleSortChange('status')}
                style={{ cursor: 'pointer' }}
                sx={{ textAlign: 'center' }}
              >
                <Box display="flex" alignItems="center" justifyContent="center">
                  <strong>Status</strong>
                  {sortBy === 'status' ? (
                    sortOrder === 'asc' ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )
                  ) : (
                    <ExpandMore fontSize="small" style={{ opacity: 0.5 }} />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Priority</strong>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Company</strong>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <strong>Source</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingLeads ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : errorLeads ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="error">{errorLeads}</Typography>
                </TableCell>
              </TableRow>
            ) : leads.length > 0 ? (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.employee?.name || 'N/A'}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.phone}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {renderStatusIcon(lead.status)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{renderPriorityIcon(lead.priority)}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.companyName}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.source?.source || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <ButtonGroup variant="outlined">
                      <Tooltip title="View Lead">
                        <Button color="info" onClick={() => handleViewClick(lead)}>
                          <Visibility fontSize="small" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Edit Lead">
                        <Button color="primary" onClick={() => handleEditClick(lead)}>
                          <Edit fontSize="small" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete Lead">
                        <Button color="secondary" onClick={() => handleDeleteClick(lead)}>
                          <Delete fontSize="small" />
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>No leads found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalLeads}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '350px', padding: '20px' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter || ''}
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value || null)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="NEW">New</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="CUSTOMER">Customer</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Assigned To</InputLabel>
          <Select
            value={selectedEmployee?.id ? String(selectedEmployee.id) : ''}
            onChange={(e: SelectChangeEvent) => {
              const emp = employees.find((employee) => employee.id === Number(e.target.value));
              setSelectedEmployee(emp || null);
            }}
            label="Assigned To"
            disabled={loadingEmployees}
          >
            <MenuItem value="">All</MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Product</InputLabel>
          <Select
            value={selectedProduct?.id ? String(selectedProduct.id) : ''}
            onChange={(e: SelectChangeEvent) => {
              const prod = products.find((p) => p.id === Number(e.target.value));
              setSelectedProduct(prod || null);
            }}
            label="Product"
            disabled={loadingProducts}
          >
            <MenuItem value="">All</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Source</InputLabel>
          <Select
            value={selectedSource?.id ? String(selectedSource.id) : ''}
            onChange={(e: SelectChangeEvent) => {
              const src = sources.find((s) => s.id === Number(e.target.value));
              setSelectedSource(src || null);
            }}
            label="Source"
            disabled={loadingSources}
          >
            <MenuItem value="">All</MenuItem>
            {sources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Start Date"
          type="date"
          fullWidth
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
          value={startDate || ''}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <TextField
          label="End Date"
          type="date"
          fullWidth
          sx={{ mb: 3 }}
          InputLabelProps={{ shrink: true }}
          value={endDate || ''}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={handleResetFilters} sx={{ mr: 1 }}>
            Reset
          </Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply
          </Button>
        </Box>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this lead?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus disabled={loadingDelete}>
            {loadingDelete ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {viewLead && (
  <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} >
    <DialogTitle>
      <Typography variant="h5" component="div" align="center" gutterBottom sx={{ color: '#3f51b5' }}>
        Lead Details
      </Typography>
    </DialogTitle>

    <DialogContent>
       <Card sx={{ marginBottom: 2, padding: 2, boxShadow: 5, borderRadius: 3, backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Table>
              <TableBody>

                {/* Basic Info */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Name</TableCell>
                  <TableCell>{viewLead.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Email</TableCell>
                  <TableCell>{viewLead.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Phone</TableCell>
                  <TableCell>{viewLead.phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Company Name</TableCell>
                  <TableCell>{viewLead.companyName}</TableCell>
                </TableRow>

                {/* Status & Priority */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Status</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {renderStatusIcon(viewLead.status)}
                      
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Priority</TableCell>
                  <TableCell>
                    <Box sx={{ }}>
                      {renderPriorityIcon(viewLead.priority) }
              
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Assignment Info */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Assigned To</TableCell>
                  <TableCell>{viewLead.employee?.name || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Source</TableCell>
                  <TableCell>{viewLead.source?.source || 'N/A'}</TableCell>
                </TableRow>

                {/* Additional Info */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Products</TableCell>
                  <TableCell>{viewLead.products.map(p => p.name).join(', ') || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Designation</TableCell>
                  <TableCell>{viewLead.designation || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Next Follow-up Date</TableCell>
                  <TableCell>{viewLead.nextFollowupDate ? dayjs(viewLead.nextFollowupDate).format('DD/MM/YYYY') : 'N/A'}</TableCell>
                </TableRow>

                {/* Description */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#3f51b5' }}>Description</TableCell>
                  <TableCell>{viewLead.description || 'N/A'}</TableCell>
                </TableRow>

              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => setOpenViewDialog(false)}
        color="primary"
        variant="contained"
        sx={{
          margin: "0 auto",
          display: "block",
          backgroundColor: '#3f51b5',
          color: '#fff',
          '&:hover': { backgroundColor: '#303f9f' }
        }}
      >
        Close
      </Button>
    </DialogActions>
    </Dialog>
)}

      {/* Edit Lead Dialog */}
      <EditLeadModal
        lead={editLead}
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSubmit={handleEditSave}
      />

      {/* Success Message Snackbar */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage(null)}>
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LeadList;