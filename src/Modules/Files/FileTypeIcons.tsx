import React from "react";
import mdiFile from "@mdi/svg/svg/file.svg";
import mdiFileExcelBox from "@mdi/svg/svg/file-excel-box.svg";
import mdiFileImage from "@mdi/svg/svg/file-image.svg";
import mdiFileMusic from "@mdi/svg/svg/file-music.svg";
import mdiFilePdfBox from "@mdi/svg/svg/file-pdf-box.svg";
import mdiFilePowerpointBox from "@mdi/svg/svg/file-powerpoint-box.svg";
import mdiFileVideo from "@mdi/svg/svg/file-video.svg";
import mdiFileWordBox from "@mdi/svg/svg/file-word-box.svg";
import mdiTextBox from "@mdi/svg/svg/text-box.svg";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

interface IFileTypeIcons {
  fullFileName: string;
  size?: number;
  fileType: string;
}

export function FileTypeIcons({
  fullFileName,
  size,
  fileType,
  ...props
}: IFileTypeIcons & Partial<CustomIconComponentProps>) {
  const fileExtension = fullFileName.split(".").pop()?.toLowerCase();

  if (fileType) {
    if (fileType.includes("image")) {
      return (
        <Icon
          component={mdiFileImage}
          size={size}
          color={"#90CAF9"}
          {...props}
        />
      );
    }

    if (fileType.includes("video")) {
      return (
        <Icon
          component={mdiFileVideo}
          size={size}
          color={"#138D75"}
          {...props}
        />
      );
    }

    if (fileType.includes("audio")) {
      return (
        <Icon
          component={mdiFileMusic}
          size={size}
          color={"#9B59B6"}
          {...props}
        />
      );
    }
  }

  switch (fileExtension) {
    case "ods":
    case "xls":
    case "xlsm":
    case "xlsx":
      return (
        <Icon
          component={mdiFileExcelBox}
          size={size}
          color={Colors.Green.Main}
          {...props}
        />
      );
    case "doc":
    case "docx":
    case "odt":
      return (
        <Icon
          component={mdiFileWordBox}
          size={size}
          color={Colors.MainBlue}
          {...props}
        />
      );
    case "rtf":
    case "tex":
    case "txt":
    case "wpd":
      return (
        <Icon component={mdiTextBox} size={size} color={"#FFB655"} {...props} />
      );
    case "pdf":
      return (
        <Icon
          component={mdiFilePdfBox}
          size={size}
          color={"#E8523F"}
          {...props}
        />
      );
    case "ppt":
    case "pptx":
      return (
        <Icon
          component={mdiFilePowerpointBox}
          size={size}
          color={"#F5BA15"}
          {...props}
        />
      );
    default:
      return (
        <Icon
          component={mdiFile}
          size={size}
          color={Colors.SecundaryBlack}
          {...props}
        />
      );
  }
}

export const getFileIconByType = (filename: string, mimeType?: string) => {
  const fileExtension = filename.split(".").pop()?.toLowerCase();
  if (mimeType) {
    if (mimeType.includes("image")) {
      return mdiFileImage;
    }

    if (mimeType.includes("video")) {
      return mdiFileVideo;
    }

    if (mimeType.includes("audio")) {
      return mdiFileMusic;
    }
  }
  switch (fileExtension) {
    case "ods":
    case "xls":
    case "xlsm":
    case "xlsx":
      return mdiFileExcelBox;
    case "doc":
    case "docx":
    case "odt":
      return mdiFileWordBox;
    case "rtf":
    case "tex":
    case "txt":
    case "wpd":
      return mdiTextBox;
    case "pdf":
      return mdiFilePdfBox;
    case "ppt":
    case "pptx":
      return mdiFilePowerpointBox;
    default:
      return mdiFile;
  }
};

export const getFileColorsByType = (filename: string, mimeType?: string) => {
  const fileExtension = filename.split(".").pop()?.toLowerCase();
  if (mimeType) {
    if (mimeType.includes("image")) {
      return "#90CAF9";
    }

    if (mimeType.includes("video")) {
      return "#138D75";
    }

    if (mimeType.includes("audio")) {
      return "#9B59B6";
    }
  }
  switch (fileExtension) {
    case "ods":
    case "xls":
    case "xlsm":
    case "xlsx":
      return Colors.Green.Main;
    case "doc":
    case "docx":
    case "odt":
      return Colors.MainBlue;
    case "rtf":
    case "tex":
    case "txt":
    case "wpd":
      return "#FFB655";
    case "pdf":
      return "#E8523F";
    case "ppt":
    case "pptx":
      return "#F5BA15";
    default:
      return Colors.SecundaryBlack;
  }
};
