import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  LineChart,
  Line,
} from "recharts";

const severityData = [
  { name: "Critical", value: 2, color: "#64d4a2" },
  { name: "High", value: 4, color: "#ff7043" },
  { name: "Medium", value: 7, color: "#90a4ae" },
  { name: "Low", value: 15, color: "#ffeb3b" },
];

const openResolvedData = [
  { name: "Open", value: 12, color: "#ff7043" },
  { name: "Resolved", value: 21, color: "#64d4a2" },
];

const slaData = [
  { month: "Oct 2024", within: 88, overdue: 12 },
  { month: "Nov 2024", within: 82, overdue: 18 },
  { month: "Dec 2024", within: 91, overdue: 9 },
  { month: "Jan 2025", within: 86, overdue: 14 },
];

const ticketsPerMonth = [
  { month: "Oct 2024", tickets: 120 },
  { month: "Nov 2024", tickets: 134 },
  { month: "Dec 2024", tickets: 142 },
  { month: "Jan 2025", tickets: 156 },
];

const summaryCards = [
  {
    label: "Pending for Acknowledgement",
    value: "05",
    background: "#ff5252",
    color: "#fff",
  },
  {
    label: "Critical",
    value: "02",
    background: "#e8f5e9",
    color: "#2e7d32",
  },
  {
    label: "High",
    value: "04",
    background: "#ff8a65",
    color: "#fff",
  },
  {
    label: "Medium",
    value: "07",
    background: "#cfd8dc",
    color: "#37474f",
  },
  {
    label: "Low",
    value: "15",
    background: "#fff59d",
    color: "#795548",
  },
];

const SupportDashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      {/* Header */}
      <Card sx={{ borderRadius: 3, boxShadow: "0px 12px 30px rgba(0,0,0,0.06)" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box component="img" src="/logo.png" alt="Anna Darpan logo" sx={{ height: 48 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                Anna Darpan
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Dashboard (Helpdesk)
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                px: 2,
                py: 0.5,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Search tickets"
                InputProps={{ disableUnderline: true }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ border: "1px solid", borderColor: "divider" }}>
                <Badge color="error" variant="dot">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>AD</Avatar>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={card.label}>
            <Card
              sx={{
                borderRadius: 3,
                background: card.background,
                color: card.color,
                height: "100%",
                boxShadow: "0px 12px 24px rgba(0,0,0,0.08)",
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Tickets by Severity (Current Month)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                  >
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Open vs Resolved (Current Month)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={openResolvedData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={6}
                  >
                    {openResolvedData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                SLA Compliance (Oct 2024 - Jan 2025)
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="within" fill="#64d4a2" name="Within SLA" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="overdue" fill="#ff7043" name="SLA Overdue" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ height: 360 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Average Tickets per Month
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tickets" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name="Tickets" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer Widget */}
      <Card sx={{ borderRadius: 3, display: "flex", justifyContent: "center" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "12px solid",
                borderColor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.palette.background.paper,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                501
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              Overall Tickets
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Anna Darpan Helpdesk Overview
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupportDashboard;
