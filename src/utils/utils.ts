import { ANALYTICS } from "firebase";
import { logEvent } from "firebase/analytics";
import i18n from "../i18n";

export const recordError = (error: Error, fatal?: boolean) => {
  console.error({ error, fatal });
  logEvent(ANALYTICS, "exception", {
    name: error.name,
    description: error.message,
    fatal,
  });
};

export const TrimRule = {
  validator: async (_: unknown, value: string) => {
    // Check if value don't have tailing or leading spaces
    if (value && value !== value.trim()) {
      return Promise.reject(
        new Error(i18n.t("Name cannot have leading or trailing spaces"))
      );
    } else {
      return Promise.resolve();
    }
  },
};

export const getDataURLFromFile = (
  file: File
): Promise<string | ArrayBuffer | null | undefined> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result);
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsDataURL(file);
  });
