'use client';

import React, { useEffect, useState } from 'react';
import { AddCircleOutline, Delete, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
  IconButton,
  Paper,
  ButtonGroup,
} from '@mui/material';
import axios from 'axios';

interface Category {
  id: number;
  categoryName: string;
}

const getCompanyIdFromLocalStorage = () => {
  return localStorage.getItem('companyId');
};

const CategoryTab: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [categoryName, setCategoryName] = useState<string>('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const companyId = getCompanyIdFromLocalStorage();
    if (companyId) {
      try {
        const response = await axios.get(`/api/${companyId}/category`);
        setCategories(response.data.data);
      } catch (error) {
        handleSnackbar('Error fetching categories', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setCategoryName(category.categoryName);
      setCurrentCategoryId(category.id);
      setEditMode(true);
    } else {
      setCategoryName('');
      setEditMode(false);
      setCurrentCategoryId(null);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditMode(false);
    setCurrentCategoryId(null);
  };

  const handleSubmit = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId) return;

    try {
      if (editMode && currentCategoryId) {
        await axios.put(`/api/${companyId}/category`, { id: currentCategoryId, categoryName });
        handleSnackbar('Category updated successfully', 'success');
      } else {
        await axios.post(`/api/${companyId}/category`, { categoryName });
        handleSnackbar('Category created successfully', 'success');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      handleSnackbar('Error saving category', 'error');
    }
  };

  const openDeleteConfirmation = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setCategoryToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId || categoryToDelete === null) return;

    try {
      await axios.delete(`/api/${companyId}/category`, { data: { id: categoryToDelete } });
      handleSnackbar('Category deleted successfully', 'success');
      fetchCategories();
      closeDeleteConfirmation();
    } catch (error) {
      handleSnackbar('Error deleting category', 'error');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Category Management
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddCircleOutline />} onClick={() => handleOpenModal()}>
            Create New Category
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : categories.length === 0 ? (
          <Typography textAlign="center" color="textSecondary">No categories available.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S NO</TableCell>
                <TableCell>Category Name</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category ,index) => (
                <TableRow key={category.id}>
                  <TableCell>{index+1}</TableCell>
                  <TableCell>{category.categoryName}</TableCell>
                  <TableCell>
                    <ButtonGroup variant="outlined" size="small">
                      <Tooltip title="Edit Category">
                        <Button onClick={() => handleOpenModal(category)} color="primary" startIcon={<Edit />}>
                       
                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete Category">
                        <Button
                          onClick={() => openDeleteConfirmation(category.id)}
                          color="error"
                          startIcon={<Delete />}
                        >
                         
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth>
        <DialogTitle>{editMode ? 'Edit Category' : 'Create New Category'}</DialogTitle>
        <DialogContent>
          <TextField sx={{ mt: 2 }} label="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onClose={closeDeleteConfirmation}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this category?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryTab;