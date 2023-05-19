import type { AvatarProps } from "antd/es";
import i18n from "../i18n";

export const recordError = (error: Error, fatal?: boolean) => {
  console.error({ error, fatal });

  import("firebase/analytics").then(({ getAnalytics, logEvent }) => {
    const analytics = getAnalytics();

    logEvent(analytics, "exception", {
      name: error.name,
      description: error.message,
      fatal,
    });
  });
};

export const TrimRule = {
  validator: async (_: unknown, value: string) => {
    // Check if value don't have tailing or leading spaces
    if (value && typeof value === "string" && value !== value.trim()) {
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

export const getAvatarObject = ({
  avatar,
  id,
}: {
  avatar?: string;
  id: string;
}): AvatarProps => ({
  src: avatar
    ? avatar
    : `https://api.dicebear.com/5.x/shapes/svg?seed=${id}&background=%23ffffff&radius=50`,
});

// Trim every string in object
export const trimObject = <T>(obj: T) => {
  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim();
      }
    });
  }
  return obj;
};
