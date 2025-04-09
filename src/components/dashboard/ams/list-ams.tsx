'use client';

import React, { useEffect, useState } from 'react';
import { CalendarViewWeekRounded, CheckRounded, ScheduleRounded, Search } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Button,
  ButtonGroup,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Box,
  TablePagination,
  Tooltip,
  Skeleton,
} from '@mui/material';
import axios from 'axios';
import EditAMSModal from './edit-ams';
import ConfirmationDialog from './confirm-delete';
import debounce from 'lodash/debounce';
import moment from 'moment';

interface AMS {
  id: string;
  customer: { customerName: string; id: string };
  product: { name: string; id: number };
  employee: { name: string; id: number };
  visitDate: string;
  status: string;
  amsCost: number;
  companyId: string;
}

const ListAMS: React.FC = () => {
  const [amsList, setAMSList] = useState<AMS[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAMS, setSelectedAMS] = useState<AMS | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId = localStorage.getItem('companyId') || 'defaultCompany';

  const fetchAMSList = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/${companyId}/ams`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchQuery?.trim() || '',
        },
      });

      setAMSList(response.data.data || []);
      setTotalRecords(response.data.total || 0);
    } catch (error) {
      setError('Failed to fetch AMS orders. Please try again later.');
      console.error('Error fetching AMS orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAMSList();
  }, [page, rowsPerPage, searchQuery]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
    setPage(0);
  }, 300);

  const handleEditClick = (ams: AMS) => {
    setSelectedAMS(ams);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedAMS: AMS) => {
    setEditModalOpen(false);
    setAMSList((prevList) =>
      prevList.map((ams) => (ams.id === updatedAMS.id ? updatedAMS : ams))
    );
  };

  const handleDeleteClick = (ams: AMS) => {
    setSelectedAMS(ams);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      if (selectedAMS) {
        await axios.delete(`/api/${companyId}/ams`, {
          params: { id: selectedAMS.id },
        });
        fetchAMSList();
      }
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete AMS order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#ffa726"; // Orange
      case "completed":
        return "#66bb6a"; // Green
      case "cancelled":
        return "#ef5350"; // Red
      default:
        return "#90a4ae"; // Grey
    }
  };

  // Calculate the starting number for the current page
  const getOrderNumber = (index: number) => {
    return page * rowsPerPage + index + 1;
  };

  return (
    <Paper elevation={4} sx={{ p: 3, maxWidth: '95%', margin: '20px auto', borderRadius: '15px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          AMS Order List
        </Typography>
        <TextField
          label="Search Customer Name"
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

      <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.light", textAlign: "center" }}>
              {["AMS Order No", "Customer", "Product", "Visit Date", "Assigned To", "Status", "Actions"].map((header) => (
                <TableCell key={header} sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((__, i) => (
                    <TableCell key={i}>
                      <Skeleton animation="wave" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
              : amsList.length > 0
                ? amsList.map((ams, index) => (
                  <TableRow key={ams.id} hover sx={{ backgroundColor: index % 2 === 0 ? "action.hover" : "inherit" }}>
                    <TableCell sx={{ fontWeight: 600 }}>AMS-{getOrderNumber(index)}</TableCell>
                    <TableCell>{ams.customer?.customerName || "N/A"}</TableCell>
                    <TableCell>{ams.product?.name || "N/A"}</TableCell>
                    <TableCell>{moment(ams.visitDate).format("DD MMM YYYY")}</TableCell>
                    <TableCell>{ams.employee?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          padding: "6px 2px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          backgroundColor: getStatusColor(ams.status),
                          color: "#fff",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {ams.status == "COMPLETED" ? <CheckRounded /> : <ScheduleRounded />}
                        {ams.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <ButtonGroup>
                        <Tooltip title="Edit Order">
                          <Button onClick={() => handleEditClick(ams)}>
                            <EditIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <Button color='error' onClick={() => handleDeleteClick(ams)}>
                            <DeleteIcon />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No AMS orders found.
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
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      <EditAMSModal
        open={editModalOpen}
        ams={selectedAMS}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this AMS order?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Paper>
  );
};

export default ListAMS;