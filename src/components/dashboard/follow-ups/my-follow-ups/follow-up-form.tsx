import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
}
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

interface Followup {
  id: number;
  nextFollowupDate: string;
  lastRequirement: string;
  status: string;
  createdAt: string;
}

interface FollowupFormProps {
  open: boolean;
  lead: Lead | null;
  followup?: Followup | null;
  onClose: () => void;
  onSave: (followup: Followup) => void;
}

const FollowupForm: React.FC<FollowupFormProps> = ({ open, lead, followup, onClose, onSave }) => {
  const [nextFollowupDate, setNextFollowupDate] = useState<Dayjs>(dayjs().add(1, 'day'));
  const [lastRequirement, setLastRequirement] = useState('');
  const [status, setStatus] = useState(lead?.status);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (followup) {
      setNextFollowupDate(dayjs(followup.nextFollowupDate));
      setLastRequirement(followup.lastRequirement);
      setStatus(lead?.status || followup.status);
    } else {
      setNextFollowupDate(dayjs().add(1, 'day'));
      setLastRequirement('');
      setStatus(lead?.status);
    }
  }, [followup]);

  const handleSubmit = () => {
    if (!lead) return;

    if (!lastRequirement) {
      setError('Please enter comments.');
      return;
    }

    const followupData = {
      id: followup?.id,
      nextFollowupDate: nextFollowupDate.toISOString(),
      lastRequirement,
      status,
      leadId: lead.id,
    };

    setLoading(true);
    setError(null);

    const apiRequest = followup
      ? axios.put(`/api/leads/follow-ups?followupId${followup?.id}`, followupData)
      : axios.post(`/api/leads/follow-ups`, followupData);

    apiRequest
      .then((response) => {
        onSave(response.data);
        onClose();
        setSnackbarMessage('Follow-up saved successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setError('Failed to save follow-up. Please try again.');
        setSnackbarMessage('Failed to save follow-up. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{followup ? 'Edit Follow-up' : 'Add Follow-up'}</DialogTitle>
      <DialogContent>
        {lead && (
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
                  {lead.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#555' }}>
                  {lead.companyName}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: '8px', color: '#777' }}>
                  {lead.designation}
                </Typography>
                <Typography variant="body2" sx={{ color: '#777' }}>
                  {lead.email}
                </Typography>
                <Typography variant="body2" sx={{ color: '#777' }}>
                  {lead.phone}
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
                  {lead.products.map((product) => product.name).join(', ')}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: '8px', color: '#777' }}>
                  {lead.description}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}

        <Grid container spacing={2} sx={{ marginTop: '16px' }}>
          <Grid item xs={12}>
            <TextField
              label="Comments"
              name="lastRequirement"
              placeholder="Add comments"
              multiline
              rows={5}
              fullWidth
              value={lastRequirement}
              error={error ? true : false}
              onChange={(e) => setLastRequirement(e.target.value)}
              required
              sx={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              variant="outlined"
              InputLabelProps={{
                style: {
                  top: '-4px', // Adjust the vertical position
                  fontSize: '14px', // Adjust the font size
                },
              }}
            />
          </Grid>
          {error && (
            <Typography sx={{ color: 'red', textAlign: 'left', margin: '5px 30px', fontSize: '14px' }}>
              {error}
            </Typography>
          )}

          <Grid item xs={6}>
            <FormControl fullWidth>

              <TextField
                fullWidth
                select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                SelectProps={{ native: true }}
                required
                sx={{ marginTop: '8px' }} 
              >
                <option value="NEW">New</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="CUSTOMER">Customer</option>
                <option value="REJECTED">Rejected</option>
              </TextField>
            </FormControl>
          </Grid>
         <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Next Follow-up Date"
                value={nextFollowupDate}
                format="MMM DD, YYYY"
                onChange={(newValue) => setNextFollowupDate(newValue!)}
                sx={{ width: '100%', marginTop: '8px' }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>

      {/* {error && (
        <Typography sx={{ color: 'red', textAlign: 'left', margin: '0px 30px' }}>
          {error}
        </Typography>
      )} */}

      <DialogActions sx={{ padding: '16px', justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default FollowupForm;
