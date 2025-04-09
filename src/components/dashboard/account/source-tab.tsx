"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Grid,
  Stack,
  ButtonGroup,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import { Edit, Delete, AddCircleOutline, UploadFile } from "@mui/icons-material";
import axios from "axios";
import debounce from "lodash.debounce";

type Source = {
  id: number;
  source: string;
  companyId: number;
  createdAt: string;
  updatedAt: string;
};

const getCompanyIdFromLocalStorage = (): string | null => {
  return localStorage.getItem("companyId");
};

const SourceTab: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [currentSource, setCurrentSource] = useState<Partial<Source>>({ source: "" });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const [errors, setErrors] = useState<{ source: string }>({ source: "" });

  const [autocompleteSources, setAutocompleteSources] = useState<Source[]>([]);
  const [loadingSource, setLoadingSource] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ source: Source | null }>({ source: null });

  // Fetch all sources
  const fetchSource = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (companyId) {
      try {
        const response = await axios.get<{ data: Source[] }>(`/api/${companyId}/sources`);
        setSources(response.data.data);
      } catch (error) {
        showSnackbar("Error fetching sources", "error");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSource();
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const validateFields = (): boolean => {
    let isValid = true;
    const newErrors = { source: "" };

    if (!currentSource.source?.trim()) {
      newErrors.source = "Source name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEdit = (source: Source) => {
    setCurrentSource(source);
    setIsEdit(true);
    setOpenModal(true);
  };

  const openDeleteConfirmation = (sourceId: number) => {
    setSourceToDelete(sourceId);
    setConfirmDeleteOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSourceToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDelete = async () => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId || sourceToDelete === null) return;

    try {
      await axios.delete(`/api/${companyId}/sources?sourceId=${sourceToDelete}`);
      fetchSource();
      showSnackbar("Source deleted successfully", "success");
      closeDeleteConfirmation();
    } catch (error) {
      showSnackbar("Error deleting source", "error");
    }
  };

  const handleCreate = () => {
    setCurrentSource({ source: "" });
    setIsEdit(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentSource({ source: "" });
    setErrors({ source: "" });
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId) return;

    try {
      if (isEdit && currentSource.id) {
        await axios.put(`/api/${companyId}/sources?sourceId=${currentSource.id}`, currentSource);
        showSnackbar("Source updated successfully", "success");
      } else {
        await axios.post(`/api/${companyId}/sources`, currentSource);
        showSnackbar("Source created successfully", "success");
      }
      fetchSource();
      handleCloseModal();
    } catch (error) {
      showSnackbar("Error saving source", "error");
    }
  };

  // Fetch all/autocomplete sources
  const fetchAllSources = async (query = "") => {
    const companyId = getCompanyIdFromLocalStorage();
    if (!companyId) return;
    setLoadingSource(true);

    try {
      const response = await axios.get<{ data: Source[] }>(`/api/${companyId}/sources`, {
        params: { query },
      });
      setAutocompleteSources(response.data.data);
    } catch (error) {
      showSnackbar("Error fetching source list", "error");
    } finally {
      setLoadingSource(false);
    }
  };

  const debouncedFetchSource = useCallback(debounce(fetchAllSources, 300), []);

  const handleAutocompleteChange = (field: string, value: Source | null) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ p: 4, paddingX: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            Source Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircleOutline />}
            onClick={handleCreate}
          >
            Create New Source
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S NO</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell>
                  <Skeleton variant="text" width="80%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width="40%" />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rectangular" width={100} height={36} />
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source, index) => (
                <TableRow key={source.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{source.source}</TableCell>
                  <TableCell>
                    <ButtonGroup variant="outlined" size="small">
                      <Tooltip title="Edit Source">
                        <Button onClick={() => handleEdit(source)} color="primary" startIcon={<Edit />} />
                      </Tooltip>
                      <Tooltip title="Delete Source">
                        <Button
                          onClick={() => openDeleteConfirmation(source.id)}
                          color="error"
                          startIcon={<Delete />}
                        />
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <UploadFile sx={{ mr: 2 }} />
            {isEdit ? "Edit Source" : "Create New Source"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Source Name"
              value={currentSource.source || ""}
              onChange={(e) => setCurrentSource({ ...currentSource, source: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!errors.source}
              helperText={errors.source}
              InputProps={{
                style: { borderRadius: 8 },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 8 }}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={closeDeleteConfirmation}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this source?</Typography>
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SourceTab;
