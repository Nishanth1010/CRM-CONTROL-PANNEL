"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';

// Define interfaces for data types
interface LeaderboardEntry {
  name: string;
  leads?: number;
  followups?: number;
}

export function LeadsLeaderboard({ leaders }: { leaders: LeaderboardEntry[] }) {
  const theme = useTheme();

  return (
    <Card sx={{ boxShadow: 3, padding: 2 }}>
      <CardHeader title="Top Lead Generators" />
      <CardContent>
        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Rank</Typography></TableCell>
                <TableCell><Typography variant="subtitle1">Name</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1">Leads</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaders.map((leader, index) => (
                <TableRow key={leader.name}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {index === 0 ? (
                        <StarIcon sx={{ color: theme.palette.warning.main }} />
                      ) : (
                        <PersonIcon color="primary" />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {leader.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {leader.leads}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export function FollowupsLeaderboard({ leaders }: { leaders: LeaderboardEntry[] }) {
  const theme = useTheme();

  return (
    <Card sx={{ boxShadow: 3, padding: 2 }}>
      <CardHeader title="Top Follow-up Performers" />
      <CardContent>
        <TableContainer component={Paper} elevation={0} sx={{ boxShadow: 'none' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle1">Rank</Typography></TableCell>
                <TableCell><Typography variant="subtitle1">Name</Typography></TableCell>
                <TableCell align="right"><Typography variant="subtitle1">Follow-ups</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaders.map((leader, index) => (
                <TableRow key={leader.name}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {index === 0 ? (
                        <StarIcon sx={{ color: theme.palette.success.main }} />
                      ) : (
                        <PersonIcon color="secondary" />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold">
                      {leader.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {leader.followups}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
