import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, ButtonGroup, Paper,
  Typography,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Box } from '@mui/system';
import { formatStatus, getStatusStyles } from '@/lib/ui-utils';

interface Followup {
  id: number;
  nextFollowupDate: string;
  lastRequirement: string;
  status: string;
  createdAt: string;
}


type StatusType = 'new' | 'in_progress' | 'customer' | 'rejected';

interface FollowupTableProps {
  followups: Followup[];
  onEdit: (followupId: number) => void;
  onDelete: (followupId: number) => void;
}

const FollowupTable: React.FC<FollowupTableProps> = ({ followups, onEdit, onDelete }) => {

  const renderStatusIcon = (status: string) => {
    const normalizedStatus = status.trim().toLowerCase() as StatusType; // Type assertion
    const colors: { new: string; in_progress: string; customer: string; rejected: string } = {
      new: '#2196F3', // Light Blue for new
      in_progress: '#F1C604', // Yellow for in progress
      customer: '#4CAF50', // Green for customer
      rejected: '#F44336', // Red for rejected
    };

    const initials: { new: string; in_progress: string; customer: string; rejected: string } = {
      new: 'NW',
      in_progress: 'IP',
      customer: 'CU',
      rejected: 'RJ',
    };

    return (
      <Box
        sx={{
          backgroundColor: colors[normalizedStatus] || '#ccc', // Fallback color
          borderRadius: '4px',
          width: '35px',
          height: '35px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        > 
          {initials[normalizedStatus] || '?'} {/* Fallback initial */}
        </Typography>
      </Box>
    );
  };



  return (
    <TableContainer component={Paper}>
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Last Connected Date</TableCell>
            <TableCell>Last Requirement</TableCell>
            <TableCell>Next Follow-up Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {followups.map((followup) => (
            <TableRow key={followup.id}>
              <TableCell>{dayjs(followup.createdAt).format('MMM DD, YYYY')}</TableCell>
              <TableCell>{followup.lastRequirement || 'N/A'}</TableCell>
              <TableCell>{dayjs(followup.nextFollowupDate).format('MMM DD, YYYY')}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {renderStatusIcon(followup.status)}
                </Box>
              </TableCell>
              <TableCell align="right">
                <ButtonGroup>
                  <IconButton color="primary" onClick={() => onEdit(followup.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => onDelete(followup.id)}>
                    <Delete />
                  </IconButton>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FollowupTable;
