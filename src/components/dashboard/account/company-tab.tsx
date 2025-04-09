"use client";

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Avatar, Paper, Divider } from '@mui/material';
import { Email, Phone, Public, LocationOn, CalendarToday, Update } from '@mui/icons-material';
import axios from 'axios';

const getCompanyIdFromLocalStorage = () => {
  return localStorage.getItem('companyId');
};

const CompanyTab: React.FC = () => {
  const [company, setCompany] = useState({
    id: 0,
    name: '',
    domain: '',
    logoUrl: '',
    gstin: '',
    cin: '',
    registerAddress: '',
    mobile: '',
    email: '',
    createdAt: '',
    updatedAt: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const companyId = getCompanyIdFromLocalStorage();
      if (companyId) {
        try {
          const response = await axios.get(`/api/company/${companyId}`);
          setCompany(response.data.data);
        } catch (error) {
          console.error('Error fetching company details', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  return (
    <Box sx={{  maxWidth: '1000px', margin: '0 auto' }}>
      <Paper
        sx={{
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
          background: '#f8f9fa',
        }}
      >
        {/* Company Header Section */}
        <Box display="flex" alignItems="center" justifyContent="space-between" paddingBottom="20px" borderBottom="1px solid #ddd">
          <Box display="flex" alignItems="center">
            <Avatar
              alt={company.name}
              src={company.logoUrl || 'https://cdn-icons-png.flaticon.com/512/8015/8015003.png'}
              sx={{
                width: 100,
                height: 100,
                boxShadow: 2,
                backgroundColor: '#e0e0e0',
                marginRight: '20px',
              }}
            />
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {company.name || 'Company Name'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {company.domain || 'www.companywebsite.com'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Company Details Section */}
        <Grid container spacing={4} marginTop="20px">
          {[{
              label: 'GSTIN', value: company.gstin, icon: null
            },
            {
              label: 'CIN', value: company.cin, icon: null
            },
            {
              label: 'Registered Address', value: company.registerAddress, icon: <LocationOn color="primary" />
            },
            {
              label: 'Phone', value: company.mobile, icon: <Phone color="primary" />
            },
            {
              label: 'Email', value: company.email, icon: <Email color="primary" />
            },
            {
              label: 'Website', value: company.domain, icon: <Public color="primary" />
            },
            {
              label: 'Created At',
              value: new Date(company.createdAt).toLocaleDateString(),
              icon: <CalendarToday color="primary" />
            },
            {
              label: 'Last Updated',
              value: new Date(company.updatedAt).toLocaleDateString(),
              icon: <Update color="primary" />
          }].map(({ label, value, icon }, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                sx={{
                  padding: '15px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Box display="flex" alignItems="center">
                  {icon && <Box sx={{ marginRight: 2 }}>{icon}</Box>}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: '4px', color: 'text.secondary' }}>
                      {value || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default CompanyTab;
