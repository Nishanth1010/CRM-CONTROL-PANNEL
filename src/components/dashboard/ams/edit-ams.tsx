import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

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

interface EditAMSModalProps {
  open: boolean;
  ams: AMS | null;
  onClose: () => void;
  onSave: (updatedAMS: AMS) => void;
}

const EditAMSModal: React.FC<EditAMSModalProps> = ({ open, ams, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visitDate, setVisitDate] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState<string>('');
  const [amsCost, setAmsCost] = useState<number | null>(null);
  const companyId = localStorage.getItem('companyId') || 'defaultCompany';

  useEffect(() => {
    if (ams) {
      setVisitDate(dayjs(ams.visitDate));
      setStatus(ams.status);
      setAmsCost(ams.amsCost);
    }
  }, [ams]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!ams) {
        throw new Error('No AMS order selected for editing.');
      }
      if (!visitDate || !status) {
        setError('Date and Status fields are required.');
        return;
      }

      const updatedAMS: AMS = {
        ...ams,
        visitDate: visitDate.format('YYYY-MM-DD'),
        status,
        amsCost: amsCost ?? ams.amsCost,
      };

      const response = await axios.put(`/api/${companyId}/ams/edit?id=${updatedAMS.id}`, updatedAMS);
      if (response.data.success) {
        onSave(updatedAMS);
        onClose();
      } else {
        setError(response.data.message || 'Failed to update AMS order.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update AMS order.');
      console.error('Error updating AMS order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit AMS Order</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField label="Customer" fullWidth value={ams?.customer.customerName || ''} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Product" fullWidth value={ams?.product.name || ''} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Assigned To" fullWidth value={ams?.employee.name || ''} disabled />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Visit Date"
                value={visitDate}
                format="DD MM YYYY"
                onChange={(newValue) => setVisitDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Status" select fullWidth value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
                <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField label="AMS Cost" type="number" fullWidth value={amsCost || ''} onChange={(e) => setAmsCost(Number(e.target.value))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">Cancel</Button>
          <Button onClick={handleSave} color="primary" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditAMSModal;