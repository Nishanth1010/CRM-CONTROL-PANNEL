import React, { useState } from 'react';
import { Assignment, CalendarToday, Close, Search } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  employees: any[];
  products: any[];
  loadingEmployees: boolean;
  loadingProducts: boolean;
  onEmployeeSearch: (input: string) => void;
  onProductSearch: (input: string) => void;
  selectedEmployee: any;
  setSelectedEmployee: (value: any) => void;
  selectedProduct: any;
  setSelectedProduct: (value: any) => void;
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  startDate: string | null;
  setStartDate: (value: string | null) => void;
  endDate: string | null;
  setEndDate: (value: string | null) => void;
  onGenerateReport: (type: 'lead' | 'followup') => void;
  searchTerm: string | null;
  setSearch: (value: any) => void;
  isTodayFollowup?: boolean;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onResetFilters,
  employees,
  products,
  loadingEmployees,
  loadingProducts,
  onEmployeeSearch,
  onProductSearch,
  selectedEmployee,
  setSelectedEmployee,
  selectedProduct,
  setSelectedProduct,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onGenerateReport,
  searchTerm,
  setSearch,
  isTodayFollowup
}) => {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleGenerate = (type: 'lead' | 'followup') => {
    setReportDialogOpen(false);
    onGenerateReport(type);
  };
  

  const handleResetFilters = () => {
    setSearch('');
    setSelectedEmployee(null);
    setSelectedProduct(null);
    setStatusFilter(null);
    setStartDate(null);
    setEndDate(null);
    onResetFilters();
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 320,
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9fb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: '600', color: '#333' }}>
          Filters
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Search Filter */}
      <TextField
        label="Search by Name or Phone"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          '& .MuiInputBase-root': {
            borderRadius: '8px',
          },
        }}
      />

      {/* Assigned To: Employee Autocomplete */}
      <Autocomplete
        options={employees}
        getOptionLabel={(option) => option.name}
        loading={loadingEmployees}
        onInputChange={(event, inputValue) => onEmployeeSearch(inputValue)}
        onChange={(event, newValue) => setSelectedEmployee(newValue)}
        value={selectedEmployee}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Assign to Employee"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingEmployees ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
            }}
          />
        )}
        sx={{ mb: 3 }}
      />

      {/* Product Autocomplete */}
      <Autocomplete
        options={products}
        getOptionLabel={(option) => option.name}
        loading={loadingProducts}
        onInputChange={(event, inputValue) => onProductSearch(inputValue)}
        onChange={(event, newValue) => setSelectedProduct(newValue)}
        value={selectedProduct}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Product"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingProducts ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
            }}
          />
        )}
        sx={{ mb: 3 }}
      />

      {/* Status Filter */}
      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter || ''}
          onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value || null)}
          sx={{
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="NEW">New</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="CUSTOMER">Customer</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </FormControl>

      {!isTodayFollowup &&

        <>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate || ''}
            onChange={(e) => setStartDate(e.target.value || null)}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
            }}
          />

          {/* End Date */}
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate || ''}
            onChange={(e) => setEndDate(e.target.value || null)}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': {
                borderRadius: '8px',
              },
            }}
          />
        </>
      }
      {/* Start Date */}


      {/* Generate Report Button */}
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={() => setReportDialogOpen(true)}
        sx={{
          mb: 3,
          fontWeight: '600',
          textTransform: 'none',
          borderRadius: '8px',
        }}
      >
        Generate Report
      </Button>

      {/* Reset and Apply Buttons */}
      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={onApplyFilters}
          sx={{
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '8px',
            backgroundColor: '#5c67f2',
            '&:hover': {
              backgroundColor: '#4b55db',
            },
          }}
        >
          Apply Filters
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={handleResetFilters}
          sx={{
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Reset Filters
        </Button>
      </Box>

      {/* Report Generation Modal */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
          Select Report Type
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              mt: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Lead Report Button */}
            <Button
              variant="outlined"
              onClick={() => handleGenerate('lead')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                width: '150px',
                height: '120px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: '600',
                borderColor: '#5c67f2',
                color: '#5c67f2',
                '&:hover': {
                  backgroundColor: '#f3f4ff',
                  borderColor: '#5c67f2',
                },
              }}
            >
              <Assignment sx={{ fontSize: '2rem', mb: 1 }} />
              Lead Report
            </Button>

            {/* Follow-Up Report Button */}
            <Button
              variant="outlined"
              onClick={() => handleGenerate('followup')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px',
                width: '150px',
                height: '120px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: '600',
                borderColor: '#333',
                color: '#333',
                '&:hover': {
                  backgroundColor: '#f7f7f7',
                  borderColor: '#333',
                },
              }}
            >
              <CalendarToday sx={{ fontSize: '2rem', mb: 1 }} />
              Follow-Up Report
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setReportDialogOpen(false)}
            color="error"
            sx={{
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '1rem',
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default FilterDrawer;