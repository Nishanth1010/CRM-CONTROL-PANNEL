"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Tooltip,
  Stack,
  ButtonGroup,
} from "@mui/material";
import { Edit, Delete, AddCircleOutline, UploadFile } from "@mui/icons-material";
import axios from "axios";
import { Warning } from "@phosphor-icons/react";

const getCompanyIdFromLocalStorage = () => {
  return localStorage.getItem("companyId");
};

const ProductTab: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>({
    name: "",
    price: "",
    description: "", // Added description field
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    description: "", // Added description field
  });

  const fetchProducts = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (companyId) {
      try {
        const response = await axios.get(`/api/company/${companyId}/products`);
        setProducts(response.data.data); // Ensure response includes `all`
      } catch (error) {
        showSnackbar("Error fetching products", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { name: "", price: "", description: "" };

    if (!currentProduct.name.trim()) {
      newErrors.name = "Product name is required";
      isValid = false;
    }
    if (!currentProduct.price) {
      newErrors.price = "Product price is required";
      isValid = false;
    } else if (isNaN(Number(currentProduct.price)) || Number(currentProduct.price) <= 0) {
      newErrors.price = "Product price must be a positive number";
      isValid = false;
    }
    if (!currentProduct.description.trim()) {
      newErrors.description = "Product description is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setIsEdit(true);
    setOpenModal(true);
  };

  const openDeleteConfirmation = (productId: number) => {
    setProductToDelete(productId);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setProductToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId || productToDelete === null) return;

    try {
      await axios.delete(`/api/company/${companyId}/products?productId=${productToDelete}`);
      fetchProducts();
      showSnackbar("Product deleted successfully", "success");
      closeDeleteConfirmation();
    } catch (error) {
      showSnackbar("Error deleting product", "error");
    }
  };

  const handleCreate = () => {
    setCurrentProduct({ name: "", price: "", description: "" });
    setIsEdit(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentProduct({ name: "", price: "", description: "" });
    setErrors({ name: "", price: "", description: "" });
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId) return;

    try {
      if (isEdit) {
        await axios.put(
          `/api/company/${companyId}/products?productId=${currentProduct.id}`,
          currentProduct
        );
        showSnackbar("Product updated successfully", "success");
      } else {
        await axios.post(`/api/company/${companyId}/products`, currentProduct);
        showSnackbar("Product created successfully", "success");
      }
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      showSnackbar("Error saving product", "error");
    }
  };

  return (
    <Box sx={{ p: 4, paddingX: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Product Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleCreate}
          >
            Create New Product
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Description</TableCell> {/* Added Description column */}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="40%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rectangular" width={100} height={36} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.price}.00 ₹</TableCell>
                  <TableCell>{product.description}</TableCell> {/* Added Description column */}
                  <TableCell>
                    <ButtonGroup variant="outlined" size="small">
                      <Tooltip title="Edit Product">
                        <Button onClick={() => handleEdit(product)} color="primary" startIcon={<Edit />}>

                        </Button>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <Button
                          onClick={() => openDeleteConfirmation(product.id)}
                          color="error"
                          startIcon={<Delete />}
                        >

                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal for Add/Edit */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UploadFile sx={{ mr: 2 }} />
            {isEdit ? "Edit Product" : "Create New Product"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Product Name"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              label="Product Price (₹)"
              value={currentProduct.price}
              onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!errors.price}
              helperText={errors.price}
              required
            />
            <TextField
              label="Product Description"
              value={currentProduct.description}
              onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={closeDeleteConfirmation} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Warning color="error" />
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
            Are you sure you want to delete this product?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action is irreversible. AMS related to this product will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteConfirmation} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductTab;