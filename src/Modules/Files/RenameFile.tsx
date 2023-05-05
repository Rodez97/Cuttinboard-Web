import {
  useDisclose,
  useFiles,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ICuttinboard_File } from "@cuttinboard-solutions/types-helpers";
import { Form, Input, Modal } from "antd";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";

export const useRenameFile = () => {
  const renameFileRef = React.useRef<RenameFileRef>(null);

  const renameCuttinboardFile = (file: ICuttinboard_File) => {
    renameFileRef.current?.renameCuttinboardFile(file);
  };

  return {
    renameCuttinboardFile,
    RenameFile: <RenameFile ref={renameFileRef} />,
  };
};

interface RenameFileRef {
  renameCuttinboardFile: (file: ICuttinboard_File) => void;
}

type FormType = {
  name: string;
};

const RenameFile = forwardRef<RenameFileRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const [baseFile, setBaseFile] = useState<ICuttinboard_File | null>(null);
  const [isOpen, open, close] = useDisclose();
  const { renameFile } = useFiles();

  useImperativeHandle(ref, () => ({
    renameCuttinboardFile,
  }));

  const handleClose = () => {
    close();
    setBaseFile(null);
  };

  const renameCuttinboardFile = (file: ICuttinboard_File) => {
    setBaseFile(file);
    open();
  };

  const onFinish = ({ name }: FormType) => {
    if (!baseFile) {
      return;
    }
    renameFile(baseFile, name);
    handleClose();
  };

  return (
    <Modal
      open={isOpen}
      title={t(`Rename file`)}
      okText={t("Accept")}
      cancelText={t("Cancel")}
      onCancel={handleClose}
      onOk={form.submit}
    >
      <Form<FormType>
        form={form}
        layout="vertical"
        style={{ width: "100%" }}
        onFinish={onFinish}
        initialValues={{
          name: "",
        }}
        autoComplete="off"
      >
        <Form.Item
          required
          name="name"
          label={t("Name")}
          help={baseFile?.name}
          rules={[
            { required: true, message: "" },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value don't have tailing or leading spaces
                if (value && value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input maxLength={80} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default RenameFile;
