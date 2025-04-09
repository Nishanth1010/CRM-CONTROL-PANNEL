'use client';

import React, { useEffect, useState } from 'react';
import { Add, CalendarToday, Close, FilterList, Search } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  Grid,
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
  Typography,
} from '@mui/material';
import { ArrowDown, ArrowUp } from '@phosphor-icons/react';
import axios from 'axios';
import dayjs from 'dayjs';
import FileSaver from 'file-saver';
import debounce from 'lodash.debounce';

import { formatStatus, getStatusStyles } from '@/lib/ui-utils';

import FilterDrawer from './filterDrawer';
import FollowupForm from './follow-up-form';
import FollowupTable from './follow-ups-table';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  designation: string;
  description: string;
  products: Product[];
  status: string;
  priority: string;
  nextFollowupDate: string;
}

type StatusType = 'new' | 'in_progress' | 'customer' | 'rejected';

interface Product {
  id: number;
  name: string;
}

interface Followup {
  id: number;
  nextFollowupDate: string;
  lastRequirement: string;
  status: string;
  createdAt: string;
}

const FollowupList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followups, setFollowups] = useState<{ [leadId: number]: Followup[] }>({});
  const [loadingLeads, setLoadingLeads] = useState<boolean>(true);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingFollowups, setLoadingFollowups] = useState<{ [leadId: number]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [openFollowupForm, setOpenFollowupForm] = useState<{
    open: boolean;
    lead: Lead | null;
    followup: Followup | null;
  }>({
    open: false,
    lead: null,
    followup: null,
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<{ open: boolean; followupId: number | null }>({
    open: false,
    followupId: null,
  });
  const [followupModal, setFollowupModal] = useState<{ open: boolean; lead: Lead | null }>({
    open: false,
    lead: null,
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [totalLeads, setTotalLeads] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [sortField, setSortField] = useState<'priority' | 'status' | 'nextFollowupDate' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  
     useEffect(() => {
      setPage(0)
     }, [searchTerm])
     
  

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

  const renderPriorityIcon = (priority: string) => {
    const normalizedPriority = priority.trim().toLowerCase() as 'low' | 'medium' | 'high'; // Type assertion
    const colors: { low: string; medium: string; high: string } = {
      low: '#4CAF50', // Green for low priority
      medium: '#FF9800', // Orange for medium priority
      high: '#F44336', // Red for high priority
    };

    const initials: { low: string; medium: string; high: string } = {
      low: 'L',
      medium: 'M',
      high: 'H',
    };

    return (
      <Box
        sx={{
          backgroundColor: colors[normalizedPriority] || '#ccc', // Fallback color
          borderRadius: '50%',
          width: '35px',
          marginX: 'auto',
          marginLeft: 2,
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
          {initials[normalizedPriority] || '?'} {/* Fallback initial */}
        </Typography>
      </Box>
    );
  };

  const renderStatusIcon = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase() as StatusType; // Type assertion
    const colors: { new: string; in_progress: string; customer: string; rejected: string } = {
      new: '#2196F3', // Light Blue for new
      in_progress: '#F1C604', // Yellow for in progress
      customer: '#4CAF50', // Green for customer
      rejected: '#F44336', // Red for rejected
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
          backgroundColor: colors[normalizedStatus] || '#ccc', // Fallback color
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
          {initials[normalizedStatus] || '?'} {/* Fallback initial */}
        </Typography>
      </Box>
    );
  };

  useEffect(() => {
    fetchLeads();
  }, [
    companyId,
    employeeId,
    page,
    rowsPerPage,
    sortField,
    sortOrder,
    searchTerm,
    statusFilter,
    selectedEmployee,
    selectedProduct,
    startDate,
    endDate,
  ]);

  const fetchLeads = () => {
    if (!companyId) return;

    setLoadingLeads(true);
    const today = dayjs().format('YYYY-MM-DD');

    const params: any = {
      employeeId: selectedEmployee?.id || employeeId,
      productId: selectedProduct?.id || null,
      page: page + 1,
      limit: rowsPerPage,
      search: searchTerm,
      sortBy: sortField,
      status: statusFilter,
      sortOrder,
      startDate,
      endDate,
    };

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
      .catch((error) => {
        console.error('Error fetching leads', error);
        setError('Unable to fetch leads. Please try again later.');
        setLoadingLeads(false);
      });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage); // Trigger fetching of new page data
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  const renderSortIcon = (field: 'priority' | 'status' | 'nextFollowupDate') => {
    return sortField === field ? (
      sortOrder === 'asc' ? (
        <ArrowUp fontSize="small" />
      ) : (
        <ArrowDown fontSize="small" />
      )
    ) : null;
  };

  const fetchEmployees = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setLoadingEmployees(true);
    try {
      const response = await axios.get(`/api/${companyId}/search-employees?search=${inputValue}`);
      setEmployees(response.data.data);
    } catch {
      console.error('Failed to load employees.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchProducts = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setLoadingProducts(true);
    try {
      const response = await axios.get(`/api/${companyId}/search-products?search=${inputValue}`);
      setProducts(response.data.data);
    } catch {
      console.error('Failed to load products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const debouncedFetchEmployees = debounce(fetchEmployees, 300);
  const debouncedFetchProducts = debounce(fetchProducts, 300);

  const handleApplyFilters = () => {
    console.log('Applying filters...');
    setIsDrawerOpen(false);
  };

  const handleResetFilters = () => {
    setSelectedEmployee(null);
    setSelectedProduct(null);
    setStatusFilter(null);
  };

  const fetchFollowups = (leadId: number) => {
    setLoadingFollowups((prev) => ({ ...prev, [leadId]: true }));
    axios
      .get(`/api/leads/follow-ups`, { params: { employeeId, leadId } })
      .then((response) => {
        setFollowups((prev) => ({ ...prev, [leadId]: response.data.data }));
        setLoadingFollowups((prev) => ({ ...prev, [leadId]: false }));
      })
      .catch((error) => {
        console.error('Error fetching follow-ups', error);
        setError('Unable to fetch follow-ups. Please try again later.');
        setLoadingFollowups((prev) => ({ ...prev, [leadId]: false }));
      });
  };

  const handleShowFollowups = (lead: Lead) => {
    setFollowupModal({ open: true, lead });
    if (!followups[lead.id]) {
      fetchFollowups(lead.id);
    }
  };

  const handleAddFollowup = (lead: Lead) => {
    setOpenFollowupForm({ open: true, lead, followup: null });
  };

  const handleEditFollowup = (lead: Lead, followup: Followup) => {
    setOpenFollowupForm({ open: true, lead, followup });
  };

  const handleGenerateReport = async (type: 'lead' | 'followup') => {
    try {
      setSnackbar({ open: true, message: 'Generating report, please wait...', severity: 'success' });

      const params: any = {
        type, // Report type (lead or followup)
        employeeId: selectedEmployee?.id || employeeId,
        productId: selectedProduct?.id || null,
        page: page + 1, // Include pagination info if needed by the backend
        limit: rowsPerPage,
        search: searchTerm,
        sortBy: sortField,
        status: statusFilter,
        sortOrder,
        startDate,
        endDate,
      };

      // Make the request to the report generation API with filters as query parameters
      const response = await axios.get(`/api/${companyId}/generate-report`, {
        params,
        responseType: 'blob', // Ensure we receive the file as a blob
      });

      // Create a Blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.xlsx`); // Set the file name dynamically
      document.body.appendChild(link);
      link.click();

      setSnackbar({ open: true, message: 'Report generated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to generate report:', error);
      setSnackbar({ open: true, message: 'Failed to generate report. Please try again.', severity: 'error' });
    }
  };

  const handleDeleteFollowup = (followupId: number) => {
    setConfirmDeleteOpen({ open: true, followupId });
  };

  const confirmDelete = () => {
    if (!confirmDeleteOpen.followupId) return;
    axios
      .delete(`/api/leads/follow-ups?followupId=${confirmDeleteOpen.followupId}`)
      .then(() => {
        const leadId = followupModal.lead?.id;
        if (leadId) {
          setFollowups((prev) => ({
            ...prev,
            [leadId]: prev[leadId].filter((f) => f.id !== confirmDeleteOpen.followupId),
          }));
        }
        setConfirmDeleteOpen({ open: false, followupId: null });
      })
      .catch(() => alert('Failed to delete follow-up.'));
  };

  const handleSort = (field: 'priority' | 'status' | 'nextFollowupDate') => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (!sortField) return 0;
    const valueA = a[sortField].toLowerCase();
    const valueB = b[sortField].toLowerCase();

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredLeads = sortedLeads.filter(
    (lead) => lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm)
  );

  return (
    <Box sx={{ padding: '20px', maxWidth: '1300px', margin: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant="h4" gutterBottom>
          List of Follow ups
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={() => setIsDrawerOpen(true)}
          sx={{ textTransform: 'none' }} // Keeps the text case as is
        >
          Filters
        </Button>
      </Box>

      {loadingLeads ? (
        <Box sx={{ textAlign: 'center', padding: '20px' }}>
          <CircularProgress />
          <Typography variant="body1" color="textSecondary">
            Loading leads...
          </Typography>
        </Box>
      ) : error ? (
        <Typography variant="body1" color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Company</TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => handleSort('nextFollowupDate')}
                >
                  Next Follow-up {renderSortIcon('nextFollowupDate')}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => handleSort('priority')}
                >
                  Priority {renderSortIcon('priority')}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  Status {renderSortIcon('status')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow hover key={lead.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.phone}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{lead.companyName}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {dayjs(lead.nextFollowupDate).format('MMM DD, YYYY')}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{renderPriorityIcon(lead.priority)}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {renderStatusIcon(lead.status)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <ButtonGroup variant="text" size="small">
                      <Button onClick={() => handleShowFollowups(lead)} startIcon={<CalendarToday />}>
                        Show
                      </Button>
                      <Button onClick={() => handleAddFollowup(lead)} startIcon={<Add />}>
                        Add
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalLeads}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      )}

      {/* Confirmation Dialog for Deleting Follow-up */}
      <Dialog open={confirmDeleteOpen.open} onClose={() => setConfirmDeleteOpen({ open: false, followupId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this follow-up?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen({ open: false, followupId: null })} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* FollowupForm Modal for Adding/Editing Follow-up */}
      {openFollowupForm.open && openFollowupForm.lead && (
        <FollowupForm
          open={openFollowupForm.open}
          lead={openFollowupForm.lead}
          followup={openFollowupForm.followup}
          onClose={() => setOpenFollowupForm({ open: false, lead: null, followup: null })}
          onSave={(newFollowup) => {
            const leadId = openFollowupForm.lead?.id;
            if (leadId) {
              setFollowups((prev) => ({
                ...prev,
                [leadId]: openFollowupForm.followup
                  ? prev[leadId].map((f) => (f.id === newFollowup.id ? newFollowup : f))
                  : [...(prev[leadId] || []), newFollowup],
              }));
              setOpenFollowupForm({ open: false, lead: null, followup: null });
              fetchFollowups(leadId);
              fetchLeads();
            }
          }}
        />
      )}

      {/* Followup Modal */}
      <Dialog
        open={followupModal.open}
        onClose={() => setFollowupModal({ open: false, lead: null })}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ backgroundColor: '#ffffff', color: '#000', padding: 2, borderBottom: '1px solid #e0e0e0' }}>
          Follow-ups for {followupModal.lead?.name}
        </DialogTitle>
        <DialogContent>
          {followupModal.lead && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {followupModal.lead.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#555' }}>
                    {followupModal.lead.companyName}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '8px', color: '#777' }}>
                    {followupModal.lead.designation}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '4px', color: '#777' }}>
                    {followupModal.lead.email}
                    </Typography>
                    <Typography variant="body2" sx={{ marginTop: '4px', color: '#777' }}>
                      {followupModal.lead.phone}
                      </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                    Products:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#007bff' }}>
                    {followupModal.lead.products.map((product) => product.name).join(', ')}
                  </Typography>
                  <Typography variant="body2" sx={{ marginTop: '8px', color: '#777' }}>
                    {followupModal.lead.description}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
          {loadingFollowups[followupModal.lead?.id || 0] ? (
            <Box sx={{ textAlign: 'center', padding: '20px' }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Loading follow-ups...
              </Typography>
            </Box>
          ) : followups[followupModal.lead?.id || 0] && followups[followupModal.lead?.id || 0].length > 0 ? (
            <FollowupTable
              followups={followups[followupModal.lead?.id || 0]}
              onEdit={(followupId) =>
                setOpenFollowupForm({
                  open: true,
                  lead: followupModal.lead,
                  followup: followups[followupModal.lead?.id || 0].find((f) => f.id === followupId) || null,
                })
              }
              onDelete={(followupId) => handleDeleteFollowup(followupId)}
            />
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 3, color: '#888' }}>
              No follow-ups available for this lead.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={() => setFollowupModal({ open: false, lead: null })}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: '500',
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': { backgroundColor: '#1565c0' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        employees={employees}
        products={products}
        loadingEmployees={loadingEmployees}
        loadingProducts={loadingProducts}
        onEmployeeSearch={debouncedFetchEmployees}
        onProductSearch={debouncedFetchProducts}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onGenerateReport={handleGenerateReport}
        searchTerm={searchTerm}
        setSearch={setSearchTerm}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FollowupList;
