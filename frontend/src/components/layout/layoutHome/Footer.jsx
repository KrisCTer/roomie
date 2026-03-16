import {
  Box,
  Container,
  Typography,
  Grid,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

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
              {/* Bạn có thể thêm key mới, ví dụ footer.description */}
              Nền tảng tìm kiếm và đặt chỗ lưu trú nhanh chóng, an toàn và tiện
              lợi trên toàn Việt Nam.
            </Typography>
          </Grid>

          {/* Cột 2 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t("footer.about")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.introduction")}
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.news")}
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.blog")}
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.careers")}
              </MuiLink>
            </Box>
          </Grid>

          {/* Cột 3 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t("footer.support")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.helpCenter")}
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.faq")}
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("footer.refundPolicy")}
              </MuiLink>
            </Box>
          </Grid>

          {/* Cột 4 */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              {t("footer.connect")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Facebook
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Instagram
              </MuiLink>
              <MuiLink
                href="#"
                underline="hover"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Twitter
              </MuiLink>
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
          <Typography>{t("footer.copyright")}</Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              mt: { xs: 2, sm: 0 },
            }}
          >
            <MuiLink
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t("footer.terms")}
            </MuiLink>
            <MuiLink
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t("footer.privacy")}
            </MuiLink>
            <MuiLink
              href="#"
              underline="hover"
              sx={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t("footer.cookies")}
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
