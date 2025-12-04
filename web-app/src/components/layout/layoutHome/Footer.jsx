import { Box, Container, Typography, Grid, Link, Divider } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        bgcolor: "#0b1b2a",
        color: "white",
        pt: 8,
        pb: 4,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        mt: 10,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Cột 1 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Roomie
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Nền tảng tìm kiếm và đặt nơi lưu trú nhanh chóng, an toàn và tiện
              lợi trên toàn Việt Nam.
            </Typography>
          </Grid>

          {/* Cột 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Về chúng tôi
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Giới thiệu
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Tin tức
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Blog
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Tuyển dụng
              </Link>
            </Box>
          </Grid>

          {/* Cột 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Trung tâm trợ giúp
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Câu hỏi thường gặp
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Chính sách hoàn tiền
              </Link>
            </Box>
          </Grid>

          {/* Cột 4 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Kết nối với chúng tôi
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Facebook
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Instagram
              </Link>
              <Link
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Twitter
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* BOTTOM */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            textAlign: { xs: "center", sm: "left" },
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
          }}
        >
          <Typography>© 2025 Roomie. Tất cả các quyền được bảo lưu.</Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Link
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
