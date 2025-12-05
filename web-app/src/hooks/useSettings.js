// web-app/src/hooks/useSettings.js
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export const useSettings = () => {
  const { i18n, t } = useTranslation();
  const { theme, setTheme, toggleTheme } = useTheme();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const getCurrentLanguage = () => i18n.language;

  const availableLanguages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const availableThemes = [
    { value: 'light', label: t('common.light'), icon: '☀️' },
    { value: 'dark', label: t('common.dark'), icon: '🌙' },
    { value: 'system', label: t('common.system'), icon: '💻' }
  ];

  return {
    // Language
    language: getCurrentLanguage(),
    changeLanguage,
    availableLanguages,
    
    // Theme
    theme,
    setTheme,
    toggleTheme,
    availableThemes,
    
    // Translation
    t
  };
};

export default useSettings;