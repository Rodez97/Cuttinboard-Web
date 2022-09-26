/** @jsx jsx */
import { jsx } from "@emotion/react";
import Compressor from "compressorjs";
import React, { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import { nanoid } from "nanoid";
import mime from "browser-mime";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import {
  Avatar,
  Button,
  Form,
  message,
  Modal,
  Slider,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import { EditOutlined, PaperClipOutlined } from "@ant-design/icons";

interface EditableAvatarProps {
  initialValue?: string;
  value?: { url: string; file?: File };
  size?: number;
  align?: "left" | "center" | "right";
  onImageEdited?: (newValue: { url: string; file?: File }) => void;
  imageBorderRadius?: number;
  compressSize?: number;
  disabled?: boolean;
}

const StyledAvatarEditor = styled(AvatarEditor)({
  alignSelf: "center",
});

function EditableAvatar({
  value,
  onImageEdited,
  size,
  align,
  initialValue,
  imageBorderRadius = 150,
  compressSize = 130,
  disabled,
}: EditableAvatarProps) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [imageScale, setImageScale] = useState<number>(1);
  const avatarEditorRef = useRef<AvatarEditor>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File>(null);

  const handleClose = () => {
    setEditOpen(false);
  };

  const handleChangeImage = async () => {
    let finalImage: File;
    if (!avatarEditorRef.current) {
      return;
    }
    const pureImage = avatarEditorRef.current?.getImage();
    const imageEditedDataURL = pureImage.toDataURL();
    pureImage.toBlob((blob) => {
      new Compressor(blob, {
        quality: 0.5,
        width: compressSize,
        height: compressSize,

        success: (result) => {
          const extension = mime.extension(result.type);
          finalImage = new File([result], `${nanoid()}.${extension}`);
          if (finalImage?.size <= 8_000_000) {
            onImageEdited({ url: imageEditedDataURL, file: finalImage });
          }
        },
        error: (error) => console.error(error),
      });
    });
    handleClose();
  };

  const handleScaleSliderChange = (newValue: number) => {
    if (isNaN(newValue)) {
      return;
    }
    setImageScale(newValue);
  };

  const props: UploadProps = {
    name: "file",
    beforeUpload: async (file) => {
      if (file.size > 8_000_000) {
        message.error(t("Your file surpasses the 8mb limit."));
        return false;
      }

      setSelectedImageFile(file);

      return false;
    },
    multiple: false,
    fileList: [],
  };

  return (
    <React.Fragment>
      <Avatar
        css={{
          alignSelf: align ?? "flex-start",
          justifySelf: align ?? "flex-start",
          cursor: !disabled && "pointer",
        }}
        size={size ?? 100}
        icon={<EditOutlined />}
        src={value?.url ?? initialValue}
        onClick={() => !disabled && setEditOpen(true)}
      />

      <Modal
        open={editOpen}
        title={t("Profile Photo")}
        onCancel={handleClose}
        footer={[
          <Button key="cancel" onClick={handleClose}>
            {t("Cancel")}
          </Button>,
          <Button key="ok" onClick={handleChangeImage} type="primary">
            {t("OK")}
          </Button>,
        ]}
      >
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            pag: 8,
            alignItems: "center",
          }}
        >
          <StyledAvatarEditor
            width={150}
            height={150}
            image={selectedImageFile}
            borderRadius={imageBorderRadius}
            scale={imageScale}
            ref={avatarEditorRef}
          />
          <Typography.Text>{t("Max 8MB")}</Typography.Text>
          <Upload {...props}>
            <Button icon={<PaperClipOutlined />}>{t("Select image")}</Button>
          </Upload>

          <div css={{ width: "100%" }}>
            <Form.Item label={t("Scale")}>
              <Slider
                value={typeof imageScale === "number" ? imageScale : 1}
                onChange={handleScaleSliderChange}
                aria-labelledby="scale-slider"
                min={1}
                max={2}
                step={0.01}
              />
            </Form.Item>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
}

export default EditableAvatar;
