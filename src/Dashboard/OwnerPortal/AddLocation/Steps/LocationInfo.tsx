/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddLocation } from "../AddLocation";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, Checkbox, Form, Input, message, Space } from "antd";
import { EditFilled, SaveFilled } from "@ant-design/icons";
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
          <Form.Item
            name="baseLoc"
            label={t("Information")}
            css={{ minWidth: 280 }}
          >
            <Input.Group>
              <Form.Item
                required
                name="name"
                rules={[{ required: true, message: "" }]}
              >
                <Input
                  required
                  maxLength={50}
                  showCount
                  placeholder={t("Location Name") + " (required)"}
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[{ type: "email", message: t("Must be a valid email") }]}
              >
                <Input
                  type="email"
                  maxLength={100}
                  placeholder={t("Email") + " (optional)"}
                />
              </Form.Item>
              <Form.Item name="phoneNumber">
                <Input
                  type="phoneNumber"
                  maxLength={30}
                  placeholder={t("Phone Number") + " (optional)"}
                />
              </Form.Item>
              <Form.Item name="intId">
                <Input
                  maxLength={90}
                  placeholder={t("Internal ID") + " (optional)"}
                />
              </Form.Item>
              <Form.Item name="description">
                <Input.TextArea
                  maxLength={255}
                  showCount
                  rows={3}
                  placeholder={t("Description") + " (optional)"}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            label={t("Address")}
            name="address"
            css={{ minWidth: 280 }}
          >
            <Input.Group>
              <Form.Item name={["address", "streetNumber"]}>
                <Input placeholder={t("Address Line 1") + " (optional)"} />
              </Form.Item>
              <Form.Item name={["address", "street"]}>
                <Input placeholder={t("Address Line 2") + " (optional)"} />
              </Form.Item>
              <Form.Item name={["address", "city"]}>
                <Input placeholder={t("City") + " (optional)"} />
              </Form.Item>
              <Form.Item name={["address", "state"]}>
                <Input placeholder={t("State") + " (optional)"} />
              </Form.Item>
              <Form.Item name={["address", "country"]}>
                <Input placeholder={t("Country") + " (optional)"} />
              </Form.Item>
              <Form.Item name={["address", "zip"]}>
                <Input placeholder={t("Zip") + " (optional)"} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            name="gm"
            css={{ minWidth: 280 }}
            label={t("General Manager")}
          >
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
