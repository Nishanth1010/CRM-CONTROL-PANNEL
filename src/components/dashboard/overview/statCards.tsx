"use client";

import * as React from "react";
import axios from "axios";
import Grid from "@mui/material/Unstable_Grid2";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import CardComponent from "@/components/dashboard/overview/card-compoent";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import {
  PersonAdd as PersonAddIcon,
  PhoneInTalk as PhoneInTalkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Group as GroupIcon,
  EventNote as EventNoteIcon,
  PendingActions as PendingActionsIcon,
  MonetizationOn as MonetizationOnIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";

// Define color palette from your image
const cardColors = {
  lightBlue: "#dbeafe",
  lightGreen: "#d1fae8",
  lightOrangeYellow: "#fff3c7",
  lightPurple: "#e9d5ff",
  pastelYellow: "#fff9c3",
  mintGreen: "#bbf7d9",
  skyBlue: "#bae6ff",
  greenTint: "#dcfce8",
  softRed: "#fee2e2",
};

interface StatusCardData {
  value: number;
  diff: number;
  trend: "up" | "down";
}

interface StatusData {
  newLeads?: StatusCardData;
  contactedLeads?: StatusCardData;
  rejectedLeads?: StatusCardData;
  customerLeads?: StatusCardData;
  dealsClosed?: StatusCardData;
  totalLeads?: StatusCardData;
  totalCustomers?: StatusCardData;
  totalDeals?: StatusCardData;
  totalFollowUpToday?: StatusCardData;
  pendingFollowUpToday?: StatusCardData;
  totalDealValue?: StatusCardData;
  totalAdvanceReceived?: StatusCardData;
  totalOutstanding?: StatusCardData;
}

const StatusCards: React.FC = () => {
  const [statusData, setStatusData] = React.useState<StatusData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [employeeId, setEmployeeId] = React.useState<number | null>(null);
  const [role, setRole] = React.useState<string | null>(null);
  const [companyId, setCompanyId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedEmployeeId = localStorage.getItem("userId");
    const storedCompanyId = localStorage.getItem("companyId");

    if (storedCompanyId) setCompanyId(Number(storedCompanyId));
    if (storedRole) setRole(storedRole);
    if (storedRole !== "admin" && storedEmployeeId) {
      setEmployeeId(Number(storedEmployeeId));
    }
  }, []);

  React.useEffect(() => {
    if (companyId) {
      fetchStats();
    }
  }, [companyId, role, employeeId]);

  async function fetchStats() {
    setLoading(true);
    try {
      const params: { employeeId?: number } = {};
      if (role !== "admin" && employeeId !== null) {
        params.employeeId = employeeId;
      }

      const statusRes = await axios.get(`/api/${companyId}/status-card`, {
        params,
      });
      if (statusRes.data.success) {
        setStatusData(statusRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching status card data:", error);
    } finally {
      setLoading(false);
    }
  }

  const cardData = [
    { 
      title: "Total Leads", 
      icon: <GroupIcon />, 
      data: statusData?.totalLeads,
      color: cardColors.lightBlue 
    },
    {
      title: "Total Customers",
      icon: <CheckCircleIcon color="success" />,
      data: statusData?.totalCustomers,
      color: cardColors.lightGreen
    },
    {
      title: "Total Deals",
      icon: <CheckCircleIcon color="primary" />,
      data: statusData?.totalDeals,
      color: cardColors.lightOrangeYellow
    },
  ];
  
  const row2CardData = [
    {
      title: "New Leads",
      icon: <PersonAddIcon color="primary" />,
      data: statusData?.newLeads,
      color: cardColors.lightPurple
    },
    {
      title: "In Progress Leads",
      icon: <PhoneInTalkIcon color="secondary" />,
      data: statusData?.contactedLeads,
      color: cardColors.pastelYellow
    },
    {
      title: "Rejected",
      icon: <CancelIcon color="error" />,
      data: statusData?.rejectedLeads,
      color: cardColors.softRed
    },
    {
      title: "Converted as Customer",
      icon: <CheckCircleIcon color="success" />,
      data: statusData?.customerLeads,
      color: cardColors.mintGreen
    },
  ];
  
  const row3CardData = [
    {
      title: "Total Follow-Up Today",
      icon: <EventNoteIcon />,
      data: statusData?.totalFollowUpToday,
      color: cardColors.skyBlue
    },
  ];

  const adminCardData = [
    {
      title: "Total Deal Value",
      icon: <MonetizationOnIcon color="primary" />,
      data: statusData?.totalDealValue,
      color: cardColors.greenTint
    },
    {
      title: "Total Advance Received",
      icon: <AccountBalanceWalletIcon color="secondary" />,
      data: statusData?.totalAdvanceReceived,
      color: cardColors.lightBlue
    },
    {
      title: "Total Outstanding",
      icon: <AccountBalanceWalletIcon color="error" />,
      data: statusData?.totalOutstanding,
      color: cardColors.softRed
    },
  ];

  return (
    <Grid container spacing={3} sx={{ width: "100%", padding: 2 }}>
      {/* Row 1 */}
      <Grid xs={12}>
        <Typography variant="h6" gutterBottom>
          General Overview
        </Typography>
      </Grid>
      {cardData.map((card, index) => (
        <Grid
          key={`row1-${index}`}
          xs={12}
          sm={6}
          md={3}
          sx={{
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" height={150} animation="wave" />
          ) : (
            <Tooltip title={card.title} arrow TransitionComponent={Zoom}>
              <CardComponent
                title={card.title}
                value={card.data?.value?.toString() || "0"}
                diff={card.data?.diff || 0}
                trend={card.data?.trend || "up"}
                icon={card.icon}
                sx={{
                  backgroundColor: card.color,
                  boxShadow: 3,
                  borderRadius: 4,
                }}
              />
            </Tooltip>
          )}
        </Grid>
      ))}
      {/* Row 2 */}
      <Grid xs={12}>
        <Typography variant="h6" gutterBottom>
          Lead Metrics
        </Typography>
      </Grid>
      {row2CardData.map((card, index) => (
        <Grid
          key={`row2-${index}`}
          xs={12}
          sm={6}
          md={3}
          sx={{
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" height={150} animation="wave" />
          ) : (
            <Tooltip title={card.title} arrow TransitionComponent={Zoom}>
              <CardComponent
                title={card.title}
                value={card.data?.value?.toString() || "0"}
                diff={card.data?.diff || 0}
                trend={card.data?.trend || "up"}
                icon={card.icon}
                sx={{
                  backgroundColor: card.color,
                  boxShadow: 3,
                  borderRadius: 4,
                }}
              />
            </Tooltip>
          )}
        </Grid>
      ))}
      {/* Row 3 */}
      <Grid xs={12}>
        <Typography variant="h6" gutterBottom>
          Follow-Up Metrics
        </Typography>
      </Grid>
      {row3CardData.map((card, index) => (
        <Grid
          key={`row3-${index}`}
          xs={12}
          sm={6}
          md={3}
          sx={{
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.05)" },
          }}
        >
          {loading ? (
            <Skeleton variant="rectangular" height={150} animation="wave" />
          ) : (
            <Tooltip title={card.title} arrow TransitionComponent={Zoom}>
              <CardComponent
                title={card.title}
                value={card.data?.value?.toString() || "0"}
                diff={card.data?.diff || 0}
                trend={card.data?.trend || "up"}
                icon={card.icon}
                sx={{
                  backgroundColor: card.color,
                  boxShadow: 3,
                  borderRadius: 4,
                }}
              />
            </Tooltip>
          )}
        </Grid>
      ))}
      {/* Admin Only Row 4 */}
      {role === "admin" && (
        <>
          <Grid xs={12}>
            <Typography variant="h6" gutterBottom>
              Financial Metrics
            </Typography>
          </Grid>
          {adminCardData.map((card, index) => (
            <Grid
              key={`admin-${index}`}
              xs={12}
              sm={6}
              md={3}
              sx={{
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {loading ? (
                <Skeleton variant="rectangular" height={150} animation="wave" />
              ) : (
                <Tooltip title={card.title} arrow TransitionComponent={Zoom}>
                  <CardComponent
                    title={card.title}
                    value={
                      card.data?.value
                        ? Number(card.data.value).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0"
                    }
                    diff={card.data?.diff || 0}
                    trend={card.data?.trend || "up"}
                    icon={card.icon}
                    sx={{
                      backgroundColor: card.color,
                      boxShadow: 1,
                      borderRadius: 5,
                    }}
                  />
                </Tooltip>
              )}
            </Grid>
          ))}
        </>
      )}
    </Grid>
  );
};

export default StatusCards;