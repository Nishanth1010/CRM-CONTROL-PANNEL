'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Snackbar, Alert, TextField, CircularProgress, Button, Grid, Typography, Paper, Divider, InputAdornment, Table, TableBody, TableCell, TableHead, TableRow, Box, Card, CardContent, Stack } from '@mui/material';
import ProductAutocomplete from '../common/product-autocomplete';
import CustomerAutocomplete from '../common/customer-autocomplete';
import EmployeeAutocomplete from '../common/employee-autocomplete';
import moment from 'moment';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';


// Types
type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

type AMSPayload = {
  customerId: string;
  productId: number;
  visitDate: string;
  amsCost: number;
  employeeId?: number;
  status: string;
  noOfVisitsPerYear: number;
  visitDates: string[];
};

const CreateAMS: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [visitDate, setVisitDate] = useState<Dayjs | null>(null);
  const [amsCost, setAmsCost] = useState<number | ''>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [noOfVisitsPerYear, setNoOfVisitsPerYear] = useState<number | ''>('');
  const [visitDates, setVisitDates] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    if (noOfVisitsPerYear && visitDate) {
      const limitedVisits = Math.min(Number(noOfVisitsPerYear), 12); // Ensure max 12 visits
      setVisitDates(calculateVisitDates(visitDate, limitedVisits));
    } else {
      setVisitDates([]);
    }
  }, [noOfVisitsPerYear, visitDate]);




  const calculateVisitDates = (startDate: Dayjs, noOfVisits: number): string[] => {
    if (!startDate || noOfVisits <= 0) return [];

    const visits = Math.min(noOfVisits, 12); // Limit visits to 12
    const dates: string[] = [];
    const start = new Date(startDate.toISOString());
    const intervalMonths = Math.floor(12 / visits);

    for (let i = 1; i <= visits; i++) {
      const newDate = new Date(start);
      newDate.setMonth(start.getMonth() + i * intervalMonths);
      dates.push(newDate.toISOString().split('T')[0]);
    }
    return dates;
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedProductId || !visitDate || !amsCost || !noOfVisitsPerYear || !selectedEmployeeId) {
      setSnackbar({ open: true, message: 'Please fill all required fields.', severity: 'error' });
      return;
    }

    const limitedVisits = Math.min(Number(noOfVisitsPerYear), 12); // Ensure max 12 visits

    try {
      const payload: AMSPayload = {
        customerId: selectedCustomerId,
        productId: selectedProductId,
        visitDate: visitDate.toISOString(),
        amsCost: amsCost as number,
        employeeId: selectedEmployeeId || undefined,
        status: 'SCHEDULED',
        noOfVisitsPerYear: limitedVisits,
        visitDates,
      };
      await axios.post(`/api/${companyId || ''}/ams`, payload);
      setSnackbar({ open: true, message: 'AMS record created successfully', severity: 'success' });

      // Reset form state
      setSelectedCustomerId(null);
      setSelectedProductId(null);
      setVisitDate(null);
      setAmsCost('');
      setSelectedEmployeeId(null);
      setNoOfVisitsPerYear('');
      setVisitDates([]);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating AMS record', severity: 'error' });
    }
  };



  // function moment(date: string) {
  //   throw new Error('Function not implemented.');
  // }


  return (
    <Paper elevation={4} sx={{ p: 5, maxWidth: 700, margin: '30px auto', borderRadius: '15px' }}>
      <Typography variant="h5" mb={3}>Create AMS</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}><CustomerAutocomplete companyId={companyId!} selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId} /></Grid>
          <Grid item xs={12}><ProductAutocomplete companyId={companyId!} selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId} /></Grid>
          <Grid item xs={6}>
            <DatePicker
              label="AMS Start Date"
              value={visitDate}
              onChange={(newValue) => setVisitDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={6}><TextField
            label="AMS Cost"
            type="number"
            fullWidth
            required
            value={amsCost}
            onChange={(e) => setAmsCost(e.target.value === '' ? '' : Number(e.target.value))}
            InputProps={{
              endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              inputProps: { inputMode: "numeric", pattern: "[0-9]*", style: { appearance: "textfield" } }
            }}
            sx={{
              "& input[type=number]": {
                MozAppearance: "textfield", // Remove default arrows on Firefox
                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                  WebkitAppearance: "none", // Remove arrows on Chrome/Safari
                  margin: 0,
                },
              },
            }}
          />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="No of Visits Per Year"
              type="number"
              fullWidth
              required
              value={noOfVisitsPerYear}
              onChange={(e) => {
                const inputValue = e.target.value;
                const value = inputValue === '' ? '' : Number(inputValue);

                if (typeof value === 'number' && value > 12) {
                  setSnackbar({ open: true, message: 'The maximum number of visits per year is 12.', severity: 'error' });
                  setNoOfVisitsPerYear(12); // Reset to 12
                } else {
                  setNoOfVisitsPerYear(value);
                }
              }}
            />


          </Grid>
          <Grid item xs={6}><EmployeeAutocomplete companyId={companyId!} selectedEmployeeId={selectedEmployeeId} setSelectedEmployeeId={setSelectedEmployeeId} /></Grid>
          <Grid item xs={12}><Button type="submit" variant="contained" fullWidth sx={{ py: 1.5, backgroundColor: '#5A67D8', '&:hover': { backgroundColor: '#4349B5' } }}>Create AMS</Button></Grid>
        </Grid>
      </form>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>Visit Schedule:</Typography>
      <Table>
        <TableHead><TableRow><TableCell>Visit No.</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
        <TableBody>
          {visitDates.length > 0 ? (
            visitDates.map((date, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{moment(date).format("DD/MM/YYYY")}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">No visits scheduled</TableCell>
            </TableRow>
          )}
        </TableBody>

      </Table>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default CreateAMS;
