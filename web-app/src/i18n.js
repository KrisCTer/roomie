import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          dashboard: "Dashboard",
          profile: "Profile",
          reviews: "Reviews",
          message: "Message",
          addProperty: "Add Property",
          logout: "Logout",

          accountSettings: "Account Settings",
          saveUpdate: "Save & Update",
          updatePassword: "Update Password",
        },
      },
      vi: {
        translation: {
          dashboard: "Bảng điều khiển",
          profile: "Hồ sơ",
          reviews: "Đánh giá",
          message: "Tin nhắn",
          addProperty: "Thêm bất động sản",
          logout: "Đăng xuất",

          accountSettings: "Cài đặt tài khoản",
          saveUpdate: "Lưu & Cập nhật",
          updatePassword: "Cập nhật mật khẩu",
        },
      },
    },
  });

export default i18n;
