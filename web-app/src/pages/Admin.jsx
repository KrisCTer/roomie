import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  CssBaseline,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Stack,
  Badge,
} from "@mui/material";

const drawerWidth = 240;

// ─────────────────────────────────────────────────────────────
// Dữ liệu demo – sau này thay bằng API backend
// ─────────────────────────────────────────────────────────────
const demoUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "USER", status: "ACTIVE" },
  { id: 2, name: "Trần Thị B", email: "b@example.com", role: "HOST", status: "BANNED" },
  { id: 3, name: "Admin", email: "admin@roomie.com", role: "ADMIN", status: "ACTIVE" },
];

const demoRooms = [
  { id: 101, title: "Căn hộ studio Q1", host: "Trần Thị B", status: "ACTIVE", price: "8.000.000" },
  { id: 102, title: "Phòng trọ Gò Vấp", host: "Nguyễn Văn A", status: "INACTIVE", price: "3.000.000" },
];

const demoRequests = [
  { id: 1001, roomTitle: "Căn hộ view Landmark 81", host: "Lê Văn C", createdAt: "21/11/2025", status: "PENDING" },
  { id: 1002, roomTitle: "Phòng trọ Thủ Đức", host: "Ngô Thị D", createdAt: "20/11/2025", status: "APPROVED" },
];

const demoBilling = [
  {
    id: 1,
    room: "Căn hộ studio Q1",
    tenant: "Nguyễn Văn A",
    month: "11/2025",
    rent: 8000000,
    electric: 450000,
    water: 150000,
    service: 200000,
    status: "UNPAID",
  },
  {
    id: 2,
    room: "Phòng trọ Gò Vấp",
    tenant: "Trần Thị B",
    month: "11/2025",
    rent: 3000000,
    electric: 200000,
    water: 100000,
    service: 150000,
    status: "PAID",
  },
];

// ─────────────────────────────────────────────────────────────
// Các panel con
// ─────────────────────────────────────────────────────────────

function UsersPanel() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Quản lý người dùng
      </Typography>

      <Box mb={2}>
        <TextField size="small" label="Tìm kiếm user" sx={{ width: 300 }} />
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {demoUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Chip
                  label={u.status}
                  size="small"
                  color={u.status === "ACTIVE" ? "success" : "error"}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined">
                    Xem
                  </Button>
                  <Button size="small" variant="contained" color="error">
                    Khóa
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function RoomsPanel() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Quản lý phòng
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tiêu đề phòng</TableCell>
            <TableCell>Chủ phòng</TableCell>
            <TableCell>Giá / tháng</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {demoRooms.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.title}</TableCell>
              <TableCell>{r.host}</TableCell>
              <TableCell>{r.price}</TableCell>
              <TableCell>
                <Chip
                  label={r.status}
                  size="small"
                  color={r.status === "ACTIVE" ? "success" : "default"}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined">
                    Xem
                  </Button>
                  <Button size="small" variant="contained" color="warning">
                    Ẩn
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function RequestsPanel() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Yêu cầu đăng phòng của user
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tiêu đề phòng</TableCell>
            <TableCell>Chủ phòng</TableCell>
            <TableCell>Ngày gửi</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {demoRequests.map((rq) => (
            <TableRow key={rq.id}>
              <TableCell>{rq.id}</TableCell>
              <TableCell>{rq.roomTitle}</TableCell>
              <TableCell>{rq.host}</TableCell>
              <TableCell>{rq.createdAt}</TableCell>
              <TableCell>
                <Chip
                  label={rq.status}
                  size="small"
                  color={
                    rq.status === "PENDING"
                      ? "warning"
                      : rq.status === "APPROVED"
                      ? "success"
                      : "error"
                  }
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="contained" color="success">
                    Duyệt
                  </Button>
                  <Button size="small" variant="contained" color="error">
                    Từ chối
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

function ChatPanel() {
  return (
    <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" mb={2}>
        Chat hỗ trợ
      </Typography>

      <Box
        sx={{
          flex: 1,
          borderRadius: 1,
          border: "1px solid #e5e7eb",
          p: 2,
          mb: 2,
          overflowY: "auto",
          bgcolor: "#f9fafb",
          fontSize: 14,
        }}
      >
        {/* Demo message */}
        <Box mb={1}>
          <Typography fontWeight={600}>Nguyễn Văn A</Typography>
          <Typography>Phòng trọ Gò Vấp còn trống không ạ?</Typography>
        </Box>
        <Box textAlign="right">
          <Typography fontWeight={600}>Admin</Typography>
          <Typography>Chào bạn, phòng còn trống đến cuối tháng nhé.</Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          placeholder="Nhập nội dung trả lời cho user..."
        />
        <Button variant="contained">Gửi</Button>
      </Stack>
    </Paper>
  );
}

function BillingPanel() {
  const format = (n) =>
    n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Quản lý tiền phòng / điện nước / dịch vụ
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Phòng</TableCell>
            <TableCell>Người thuê</TableCell>
            <TableCell>Tháng</TableCell>
            <TableCell>Tiền phòng</TableCell>
            <TableCell>Điện</TableCell>
            <TableCell>Nước</TableCell>
            <TableCell>Dịch vụ</TableCell>
            <TableCell>Tổng</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {demoBilling.map((b) => {
            const total = b.rent + b.electric + b.water + b.service;
            return (
              <TableRow key={b.id}>
                <TableCell>{b.room}</TableCell>
                <TableCell>{b.tenant}</TableCell>
                <TableCell>{b.month}</TableCell>
                <TableCell>{format(b.rent)}</TableCell>
                <TableCell>{format(b.electric)}</TableCell>
                <TableCell>{format(b.water)}</TableCell>
                <TableCell>{format(b.service)}</TableCell>
                <TableCell>{format(total)}</TableCell>
                <TableCell>
                  <Chip
                    label={b.status === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                    size="small"
                    color={b.status === "PAID" ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={b.status === "PAID"}
                  >
                    Xác nhận đã thu
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

// ─────────────────────────────────────────────────────────────
// Trang Admin chính
// ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [menu, setMenu] = useState("users");

  const renderContent = () => {
    switch (menu) {
      case "users":
        return <UsersPanel />;
      case "rooms":
        return <RoomsPanel />;
      case "requests":
        return <RequestsPanel />;
      case "chat":
        return <ChatPanel />;
      case "billing":
        return <BillingPanel />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "#0b1b2a",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Roomie Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer trái */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItemButton
              selected={menu === "users"}
              onClick={() => setMenu("users")}
            >
              <ListItemText primary="Quản lý user" />
            </ListItemButton>
            <ListItemButton
              selected={menu === "rooms"}
              onClick={() => setMenu("rooms")}
            >
              <ListItemText primary="Quản lý phòng" />
            </ListItemButton>
            <ListItemButton
              selected={menu === "requests"}
              onClick={() => setMenu("requests")}
            >
              <Badge
                color="warning"
                variant="dot"
                overlap="circular"
                sx={{ mr: 1 }}
              />
              <ListItemText primary="Yêu cầu đăng phòng" />
            </ListItemButton>
            <ListItemButton
              selected={menu === "chat"}
              onClick={() => setMenu("chat")}
            >
              <ListItemText primary="Chat" />
            </ListItemButton>
            <ListItemButton
              selected={menu === "billing"}
              onClick={() => setMenu("billing")}
            >
              <ListItemText primary="Tiền phòng / điện nước" />
            </ListItemButton>
          </List>
          <Divider />
        </Box>
      </Drawer>

      {/* Nội dung chính */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f3f4f6",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}
