/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddLocation } from "../AddLocation";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, Checkbox, Form, Input, message, Space } from "antd";
import {
  EditFilled,
  MinusOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import LocationEditor from "components/LocationEditor";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";

type locFormType = Partial<Location> & {
  gm: {
    name: string;
    lastName: string;
    email: string;
  };
};

function LocationInfo() {
  const [locationForm] = Form.useForm<locFormType>();
  const { t } = useTranslation();
  const { location, setLocation, setGeneralManager } = useAddLocation();
  const { user } = useCuttinboard();
  const [saved, setSaved] = useState(false);
  const [addGM, setAddGM] = useState(false);

  const onFinish = async (values: locFormType) => {
    const { gm, ...locData } = values;
    setLocation(locData);
    if (addGM) {
      setGeneralManager(gm);
    }
    setSaved(true);
    message.success(t("Changes saved"));
  };

  return (
    <div
      css={{
        display: "flex",
        minWidth: 300,
        margin: "auto",
        flexDirection: "column",
      }}
    >
      <Form<locFormType>
        form={locationForm}
        layout="vertical"
        initialValues={{
          ...location,
        }}
        onFinish={onFinish}
        disabled={saved}
        size="small"
      >
        <Form.Item>
          <Checkbox
            checked={addGM}
            onChange={(e) => setAddGM(e.target.checked)}
          >
            {t("Add General Manager?")}
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="gm"
          css={{
            display: addGM ? "block" : "none",
            border: "1px dotted #00000025",
            padding: 5,
          }}
        >
          <Input.Group>
            <Form.Item
              name={["gm", "name"]}
              rules={[
                {
                  validator(_, value) {
                    if (!value && addGM) {
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder={t("Name")} />
            </Form.Item>
            <Form.Item
              name={["gm", "lastName"]}
              rules={[
                {
                  validator(_, value) {
                    if (!value && addGM) {
                      return Promise.reject();
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder={t("Last Name")} />
            </Form.Item>
            <Form.Item
              name={["gm", "email"]}
              rules={[
                {
                  validator(_, value) {
                    if (!value && addGM) {
                      return Promise.reject();
                    }
                    if (value && addGM && value === Auth.currentUser.email) {
                      return Promise.reject(
                        new Error(t("You can't be the GM"))
                      );
                    }
                    return Promise.resolve();
                  },
                },
                { type: "email", message: t("Must be a valid email") },
              ]}
            >
              <Input placeholder={t("Email")} />
            </Form.Item>
          </Input.Group>
        </Form.Item>

        <Form.Item
          required
          name="name"
          rules={[{ required: true, message: "" }]}
        >
          <Input maxLength={50} showCount placeholder={t("Name")} />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ type: "email", message: t("Must be a valid email") }]}
        >
          <Input type="email" maxLength={100} placeholder={t("Email")} />
        </Form.Item>
        <Form.Item name="phoneNumber">
          <Input
            type="phoneNumber"
            maxLength={30}
            placeholder={t("Phone Number")}
          />
        </Form.Item>
        <Form.Item name="intId">
          <Input maxLength={90} placeholder={t("Internal ID")} />
        </Form.Item>
        <Form.Item name="description">
          <Input maxLength={255} showCount placeholder={t("Description")} />
        </Form.Item>
        <Form.Item label={t("Address")} name="address">
          <Input.Group>
            <Form.Item name={["address", "streetNumber"]}>
              <Input placeholder={t("Street Number")} />
            </Form.Item>
            <Form.Item name={["address", "street"]}>
              <Input placeholder={t("Street")} />
            </Form.Item>
            <Form.Item name={["address", "city"]}>
              <Input placeholder={t("City")} />
            </Form.Item>
            <Form.Item name={["address", "state"]}>
              <Input placeholder={t("State")} />
            </Form.Item>
            <Form.Item name={["address", "country"]}>
              <Input placeholder={t("Country")} />
            </Form.Item>
            <Form.Item name={["address", "zip"]}>
              <Input placeholder={t("Zip")} />
            </Form.Item>
          </Input.Group>
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
          onClick={locationForm.submit}
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
