/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddLocation } from "../AddLocation";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, Checkbox, Divider, Form, Input, message, Space } from "antd";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";

type locFormType = Partial<Location> & {
  gm: {
    name: string;
    lastName: string;
    email: string;
  };
};

function LocationInfo() {
  const { user } = useCuttinboard();
  const [locationForm] = Form.useForm<locFormType>();
  const { t } = useTranslation();
  const { location, setLocation, setGeneralManager } = useAddLocation();
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
        flexDirection: "column",
        paddingTop: 20,
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
        autoComplete="off"
      >
        <Space
          wrap
          css={{
            justifyContent: "space-evenly",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <Form.Item css={{ minWidth: 280 }}>
            <Divider orientation="left">{t("Information")}</Divider>
            <Input.Group size="small">
              <Form.Item
                required
                name="name"
                rules={[{ required: true, message: "" }]}
                label={t("Location Name")}
              >
                <Input maxLength={50} showCount />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[{ type: "email", message: t("Must be a valid email") }]}
                label={t("Email")}
              >
                <Input type="email" maxLength={100} />
              </Form.Item>
              <Form.Item name="phoneNumber" label={t("Phone Number")}>
                <Input type="phoneNumber" maxLength={30} />
              </Form.Item>
              <Form.Item name="intId" label={t("Internal ID")}>
                <Input maxLength={90} />
              </Form.Item>
              <Form.Item name="description" label={t("Description")}>
                <Input.TextArea maxLength={255} showCount rows={3} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item css={{ minWidth: 280 }}>
            <Divider orientation="left">{t("Address")}</Divider>
            <Input.Group>
              <Form.Item
                name={["address", "streetNumber"]}
                label={t("Address Line 1")}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["address", "street"]}
                label={t("Address Line 2")}
              >
                <Input />
              </Form.Item>
              <Form.Item name={["address", "city"]} label={t("City")}>
                <Input />
              </Form.Item>
              <Form.Item name={["address", "state"]} label={t("State")}>
                <Input />
              </Form.Item>
              <Form.Item name={["address", "country"]} label={t("Country")}>
                <Input />
              </Form.Item>
              <Form.Item name={["address", "zip"]} label={t("Zip")}>
                <Input />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item css={{ minWidth: 280 }}>
            <Divider orientation="left">{t("General Manager")}</Divider>
            <Form.Item>
              <Checkbox
                checked={addGM}
                onChange={(e) => setAddGM(e.target.checked)}
              >
                {t("Add General Manager?")}
              </Checkbox>
            </Form.Item>
            <Input.Group
              css={{
                display: addGM ? "block" : "none",
                border: "1px dotted #00000025",
                padding: 5,
              }}
            >
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
                label={t("Name")}
              >
                <Input />
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
                label={t("Last Name")}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["gm", "email"]}
                rules={[
                  {
                    validator(_, value) {
                      if (!value && addGM) {
                        return Promise.reject();
                      }
                      if (value && addGM && value === user.email) {
                        return Promise.reject(
                          new Error(t("You can't be the GM"))
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                  { type: "email", message: t("Must be a valid email") },
                ]}
                label={t("Email")}
              >
                <Input />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Space>
      </Form>

      {saved ? (
        <Button
          type="dashed"
          icon={<EditFilled />}
          onClick={() => setSaved(false)}
          css={{ width: 250, alignSelf: "center" }}
        >
          {t("Edit")}
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={locationForm.submit}
          icon={<SaveFilled />}
          css={{ width: 250, alignSelf: "center" }}
        >
          {t("Save")}
        </Button>
      )}
    </div>
  );
}

export default LocationInfo;
