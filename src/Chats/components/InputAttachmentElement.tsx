/** @jsx jsx */
import { jsx } from "@emotion/react";
import { CloseOutlined, FileFilled } from "@ant-design/icons";
import { GrayPageHeader } from "../../shared";
import { FileAttachment } from "./ChatInput";

export function InputAttachmentElement({
  selectedFile,
  cancelAttachment,
}: {
  selectedFile: FileAttachment;
  cancelAttachment: () => void;
}) {
  return (
    <GrayPageHeader
      css={{
        border: "1px solid #00000025",
      }}
      title={selectedFile.name}
      extra={[<CloseOutlined key="close" onClick={cancelAttachment} />]}
      avatar={{
        shape: "square",
        size: 70,
        src: selectedFile.dataURL as string,
        icon: <FileFilled />,
      }}
    />
  );
}
