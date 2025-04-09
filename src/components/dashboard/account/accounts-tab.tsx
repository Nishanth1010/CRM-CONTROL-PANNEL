"use client"

import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import CompanyTab from './company-tab';
import EmployeeTab from './employee-tab';
import ProductTab from './product-tab';
import SourceTab from './source-tab';

export const TabsLayout: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 600,
        margin: 'auto',
        padding: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
      }}
    >
      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange} 
        centered 
        textColor="primary"
        indicatorColor="primary"
        sx={{ marginBottom: 2 }}
      >
        <Tab label="Company" />
        <Tab label="Employee" />
        <Tab label="Product" />
        <Tab label="Source" />
      </Tabs>

      <Box sx={{ padding: 2 }}>
        {selectedTab === 0 && <CompanyTab />}
        {selectedTab === 1 && <EmployeeTab />}
        {selectedTab === 2 && <ProductTab />}
        {selectedTab === 3 && <SourceTab />}
      </Box>
    </Box>
  );
};
