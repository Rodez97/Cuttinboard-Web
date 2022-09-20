import { Storage } from "@cuttinboard/cuttinboard-library/firebase";
import { Cuttinboard_File } from "@cuttinboard/cuttinboard-library/models";
import { message } from "antd";
import { deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

function useFileItem(file: Cuttinboard_File) {
  const { t } = useTranslation();
  const [downloadUrl, setDownloadUrl] = useState<string>(null);

  const getUrl = useCallback(async () => {
    if (downloadUrl) {
      return downloadUrl;
    }
    try {
      const fileRef = ref(Storage, file.storagePath);
      const url = await getDownloadURL(fileRef);
      setDownloadUrl(url);
      return url;
    } catch (error) {
      recordError(error);
    }
  }, [downloadUrl, file.storagePath]);

  const copyToClipboard = async () => {
    try {
      const url = await getUrl();
      await navigator.clipboard.writeText(url);
      message.success(t("URL copied to clipboard"));
    } catch (error) {
      recordError(error);
    }
  };

  const openFile = async () => {
    try {
      const url = await getUrl();
      window.open(url, "_blanc");
    } catch (error) {
      recordError(error);
    }
  };

  const deleteFile = async () => {
    try {
      await deleteDoc(file.docRef);
    } catch (error) {
      recordError(error);
    }
  };
  return { getUrl, copyToClipboard, openFile, deleteFile, downloadUrl };
}

export default useFileItem;
