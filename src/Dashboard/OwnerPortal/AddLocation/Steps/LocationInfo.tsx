/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddLocation } from "../AddLocation";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, Form, Input, message, Space } from "antd";
import {
  EditFilled,
  MinusOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";

function LocationInfo() {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { location, setLocation, setGeneralManager } = useAddLocation();
  const { user } = useCuttinboard();
  const [saved, setSaved] = useState(false);

  const onFinish = async (
    values: Location & {
      gmName: string;
      gmLastName: string;
      gmEmail: string;
    }
  ) => {
    const { gmName, gmLastName, gmEmail, ...rest } = values;
    setLocation(rest);
    if (gmName && gmLastName && gmEmail) {
      setGeneralManager({
        name: gmName,
        lastName: gmLastName,
        email: gmEmail,
      });
    }
    setSaved(true);
    message.success(t("Changes saved"));
  };

  return (
    <div
      css={{
        display: "flex",
        minWidth: 300,
        maxWidth: 500,
        margin: "auto",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          ...location,
        }}
        disabled={saved}
        onFinish={onFinish}
        size="small"
      >
        <Form.List name="gm">
          {(fields, { add, remove }) => (
            <React.Fragment>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  css={{
                    border: "1px dotted #ff000024",
                    display: "flex",
                    padding: 10,
                  }}
                  direction="vertical"
                >
                  <Form.Item
                    {...restField}
                    name="gmName"
                    rules={[
                      { max: 50, message: t("Name is too long") },
                      { required: true, message: "" },
                    ]}
                  >
                    <Input placeholder={t("Name")} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name="gmLastName"
                    dependencies={["gmAdd"]}
                    rules={[
                      { max: 50, message: t("Last Name is too long") },
                      { required: true, message: "" },
                    ]}
                  >
                    <Input placeholder={t("Last Name")} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name="gmEmail"
                    rules={[
                      { type: "email", message: t("Must be a valid email") },
                      {
                        max: 255,
                        message: t("Email is too long"),
                      },
                      { required: true, message: "" },
                      () => ({
                        validator(_, value) {
                          if (value && value === user.email) {
                            return Promise.reject(
                              new Error(t("You can't be the GM"))
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input type="email" placeholder={t("Email")} />
                  </Form.Item>
                </Space>
              ))}

              <Form.Item>
                {fields.length === 1 ? (
                  <Button
                    type="dashed"
                    onClick={() => remove(0)}
                    block
                    icon={<MinusOutlined />}
                  >
                    {t("Remove General Manager")}
                  </Button>
                ) : (
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t("Add General Manager")}
                  </Button>
                )}
              </Form.Item>
            </React.Fragment>
          )}
        </Form.List>

        <Form.Item
          label={t("Name")}
          name="name"
          rules={[
            { required: true, message: "" },
            { max: 50, message: t("Name is too long") },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("Description")}
          name="description"
          rules={[{ max: 200, message: t("Description is too long") }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("Address")}
          name="address"
          rules={[
            {
              max: 200,
              message: t("Address is too long"),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("Email")}
          name="email"
          rules={[
            { type: "email", message: t("Must be a valid email") },
            {
              max: 255,
              message: t("Email is too long"),
            },
          ]}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label={t("Phone Number")}
          name="phoneNumber"
          rules={[
            {
              max: 20,
              message: t("Phone number is too long"),
            },
          ]}
        >
          <Input type="tel" />
        </Form.Item>
        <Form.Item
          label={t("Internal Id")}
          name="intId"
          rules={[
            {
              max: 20,
              message: t("Internal ID is too long"),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
      {saved ? (
        <Button
          type="dashed"
          icon={<EditFilled />}
          onClick={() => setSaved(false)}
          block
        >
          {t("Edit")}
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={form.submit}
          icon={<SaveFilled />}
          block
        >
          {t("Save")}
        </Button>
      )}
    </div>
  );
}

export default LocationInfo;
