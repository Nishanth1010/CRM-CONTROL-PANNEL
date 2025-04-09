import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
} from '@mui/material';
import axios from 'axios';
import ExcelJS from 'exceljs';

const BulkUpload: React.FC<{ companyId: number | null }> = ({ companyId }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");
    worksheet.addRow([
      "name",
      "email",
      "phone",
      "designation",
      "companyName",
      "place",
      "sourceName",
      "employeeName",
      "description",
      "status",
      "priority",
      "nextFollowupDate",
    ]);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "LeadTemplate.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !companyId) {
      setError("Please select a file and ensure company ID is set.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post(`/api/${companyId}/lead/bulk-upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccessMessage("Bulk upload successful!");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during bulk upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleOpen}>
        Bulk Upload
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Upload Leads</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Download the template, fill it with lead information, and upload it back.
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Note: If a field is empty, it will be marked as "NA".
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button variant="outlined" onClick={handleDownloadTemplate} fullWidth>
                Download Template
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                component="label"
                color="primary"
                fullWidth
              >
                Upload File
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
          </Grid>

          {file && (
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Selected file: {file.name}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" gutterBottom>
              {error}
            </Typography>
          )}
          {successMessage && (
            <Typography variant="body2" color="success" gutterBottom>
              {successMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkUpload;