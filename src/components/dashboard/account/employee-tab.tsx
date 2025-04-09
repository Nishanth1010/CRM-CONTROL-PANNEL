'use client';

import React, { useEffect, useState } from 'react';
import { AddCircleOutline, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import axios from 'axios';

enum AccessLevel {
  ALL_ACCESS = 'ALL_ACCESS',
  LEADS = 'LEADS',
  ADMIM = 'ADMIN',
  FOLLOW_UPS = 'FOLLOW_UPS',
  CUSTOMER = 'CUSTOMER'
}

interface Employee {
  id: number;
  email: string;
  name: string;
  profileImg?: string;
  accessLevel: AccessLevel;
}

const getCompanyIdFromLocalStorage = () => {
  return localStorage.getItem('companyId');
};

const accessLevelDisplay: Record<AccessLevel, string> = {
  [AccessLevel.ALL_ACCESS]: 'Full Access',
  [AccessLevel.LEADS]: 'Leads Management',
  [AccessLevel.FOLLOW_UPS]: 'Follow-ups Management',
  [AccessLevel.ADMIM]: 'Admin',
  [AccessLevel.CUSTOMER]: 'Customer Management'
};

const EmployeeTab: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    accessLevel: AccessLevel.ALL_ACCESS as AccessLevel,
    profileImg: '',
  });

  const fetchEmployees = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (companyId) {
      try {
        const response = await axios.get(`/api/company/${companyId}/employees`);
        setEmployees(response.data.data);
      } catch (error) {
        console.error('Error fetching employees', error);
        handleSnackbar('Error fetching employees', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleOpenModal = (employee?: Employee) => {
    if (employee) {
      setNewEmployee({
        name: employee.name,
        email: employee.email,
        accessLevel: employee.accessLevel,
        profileImg: employee.profileImg || '',
      });
      setCurrentEmployeeId(employee.id);
      setEditMode(true);
    } else {
      setNewEmployee({
        name: '',
        email: '',
        accessLevel: AccessLevel.ALL_ACCESS,
        profileImg: '',
      });
      setEditMode(false);
      setCurrentEmployeeId(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setCurrentEmployeeId(null);
    setNewEmployee({ ...newEmployee, profileImg: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setNewEmployee({
      ...newEmployee,
      [name]: name === "email" ? value.toLowerCase() : value,
    });
  };

  const handleAccessLevelChange = (e: SelectChangeEvent) => {
    setNewEmployee({
      ...newEmployee,
      accessLevel: e.target.value as AccessLevel,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await convertImageToBase64(file);
      setNewEmployee({ ...newEmployee, profileImg: base64 });
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId) return;

    try {
      if (editMode && currentEmployeeId) {
        await axios.put(`/api/company/${companyId}/employees?employeeId=${currentEmployeeId}`, newEmployee);
        handleSnackbar('Employee updated successfully', 'success');
      } else {
        await axios.post(`/api/company/${companyId}/employees`, newEmployee);
        handleSnackbar('Employee created successfully', 'success');
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error creating/updating employee', error);
      const message = error.response?.data?.message || 'Error creating/updating employee';
      handleSnackbar(message, 'error');
    }
  };

  const handleDelete = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId || employeeToDelete === null) return;

    try {
      await axios.delete(`/api/company/${companyId}/employees?employeeId=${employeeToDelete}`);
      handleSnackbar('Employee deleted successfully', 'success');
      setConfirmDeleteDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error('Error deleting employee', error);
      const message = error.response?.data?.message || 'Error deleting employee';
      handleSnackbar(message, 'error');
    }
  };

  const openConfirmDeleteDialog = (employeeId: number) => {
    setEmployeeToDelete(employeeId);
    setConfirmDeleteDialogOpen(true);
  };

  const closeConfirmDeleteDialog = () => {
    setEmployeeToDelete(null);
    setConfirmDeleteDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4 , paddingX : 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Employee Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={() => handleOpenModal()}
          >
            Create New Employee
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Access Level</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton variant="circular" width={50} height={50} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="80%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="60%" />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width="40%" />
                    </TableCell>
                  </TableRow>
                ))
              : employees.map((employee: Employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Avatar alt={employee.name} src={employee.profileImg || undefined} sx={{ width: 50, height: 50 }}>
                        {!employee.profileImg && employee.name ? employee.name.charAt(0) : null}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {employee.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {accessLevelDisplay[employee.accessLevel] || 'Employee'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Employee">
                        <IconButton onClick={() => handleOpenModal(employee)} color="primary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Employee">
                        <IconButton onClick={() => openConfirmDeleteDialog(employee.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDeleteDialogOpen} onClose={closeConfirmDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this employee?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Create/Edit Employee */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>{editMode ? 'Edit Employee' : 'Create New Employee'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
              Upload Profile Image
              <input type="file" hidden onChange={handleImageChange} />
            </Button>
            {newEmployee.profileImg && <Avatar src={newEmployee.profileImg} sx={{ width: 100, height: 100, mb: 2 }} />}
            <TextField
              label="Name"
              name="name"
              value={newEmployee.name}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Email"
              name="email"
              value={newEmployee.email}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              required
            />
            <FormControl fullWidth>
              <InputLabel>Access Level</InputLabel>
              <Select value={newEmployee.accessLevel} onChange={handleAccessLevelChange} label="Access Level">
                <MenuItem value={AccessLevel.LEADS}>Leads Management</MenuItem>
                <MenuItem value={AccessLevel.FOLLOW_UPS}>Follow-ups Management</MenuItem>
                <MenuItem value={AccessLevel.CUSTOMER}>Customer Management</MenuItem>
                <MenuItem value={AccessLevel.ALL_ACCESS}>Full Access</MenuItem>
                <MenuItem value={AccessLevel.ADMIM}>Admin</MenuItem>             
                 </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeTab;
