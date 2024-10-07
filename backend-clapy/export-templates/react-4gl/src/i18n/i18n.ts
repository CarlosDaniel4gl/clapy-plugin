import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    debug: true,
    detection: {
      order: ["localStorage", "navigator"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
