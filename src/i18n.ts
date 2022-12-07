import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/es";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

const fallbackLng = ["en"];
const availableLanguages = ["en", "es"];

i18n
  .use(HttpApi)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init(
    {
      preload: ["en", "es"],
      fallbackLng,
      debug: false,
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      },
      //react: { useSuspense: false },
      supportedLngs: availableLanguages,
    },
    (err, t) => {
      if (err) {
        console.log(err);
      } else {
        console.log("i18n initialized");
      }
      dayjs.locale(i18n.language);
    }
  );

export default i18n;
