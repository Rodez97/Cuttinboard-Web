import { Cuttinboard_File } from "@cuttinboard-solutions/cuttinboard-library/models";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

function useFileItem(file: Cuttinboard_File) {
  const { t } = useTranslation();

  const copyToClipboard = async () => {
    try {
      const url = await file.getUrl();
      await navigator.clipboard.writeText(url);
      message.success(t("URL copied to clipboard"));
    } catch (error) {
      recordError(error);
    }
  };

  const openFile = async () => {
    try {
      const url = await file.getUrl();
      window.open(url, "_blanc");
    } catch (error) {
      recordError(error);
    }
  };

  const deleteFile = async () => {
    try {
      await file.delete();
    } catch (error) {
      recordError(error);
    }
  };
  return { copyToClipboard, openFile, deleteFile };
}

export default useFileItem;
