import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { SxProps, Theme } from "@mui/material/styles";

interface CardComponentProps {
  title: string;
  value: string;
  diff: number;
  trend: "up" | "down";
  icon: React.ReactNode;
  sx?: SxProps<Theme>;
}

const CardComponent: React.FC<CardComponentProps> = ({
  title,
  value,
  diff,
  trend,
  icon,
  sx,
}) => {
  return (
    <Card sx={{ height: "100%", ...sx }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            color="textSecondary"
            gutterBottom
            variant="overline"
            sx={{
              fontWeight: "bold", // <- this is the key change
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Box>{icon}</Box>
        </Box>
        <Typography variant="h3" >{value}</Typography>
        <Box display="flex" alignItems="center" mt={2}>
          {trend === "up" ? (
            <ArrowUpwardIcon color="success" />
          ) : (
            <ArrowDownwardIcon color="error" />
          )}
          <Typography
            variant="body1"
            sx={{ color: trend === "up" ? "success.main" : "error.main", ml: 1 }}
          >
            {diff}%
          </Typography>
          <Typography
            color="textSecondary"
            variant="caption"
            sx={{ ml: 1 }}
          >
            Since last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardComponent;
