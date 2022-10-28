/** @jsx jsx */
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import {
  Alert,
  Button,
  Form,
  Input,
  Layout,
  Space,
  Steps,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LocationsPicker from "./LocationsPicker";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import {
  Auth,
  Functions,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";

const { Step } = Steps;

type supervisor = {
  name: string;
  lastName: string;
  email: string;
};

function NewSupervisor() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [executeCallable, loading, error] = useHttpsCallable(
    Functions,
    "http-employees-create"
  );
  const [supervisorData, setsupervisorData] = useState<supervisor>(null);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

  const getStatusText = (stp: number) => {
    if (stp === step) {
      return t("In Progress");
    }
    if (stp > step) {
      return t("Waiting");
    }
    return t("Finished");
  };
  const getStatus = (stp: number) => {
    if (stp === step) {
      return "process";
    }
    if (stp > step) {
      return "wait";
    }
    return "finish";
  };

  const onSupervisorFormFinish = (values: supervisor) => {
    setsupervisorData(values);
    setStep(2);
  };

  const createSupervisor = async () => {
    try {
      await executeCallable({
        ...supervisorData,
        role: RoleAccessLevels.ADMIN,
        supervisingLocations: selectedLocations.map((sl) => sl.id),
      });
      navigate(-1);
    } catch (error) {
      recordError(error);
    }
  };
  return (
    <Layout
      css={{
        padding: "20px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "25px",
      }}
    >
      <Steps current={step} css={{ maxWidth: "600px" }}>
        <Step
          status={getStatus(1)}
          title={getStatusText(1)}
          description={t("Add Supervisor")}
        />
        <Step
          status={getStatus(2)}
          title={getStatusText(2)}
          description={t("Assign Locations")}
        />
      </Steps>

      {error && <Alert type="error" showIcon message={error.message} />}

      {step === 1 ? (
        <React.Fragment>
          <Alert
            type="warning"
            showIcon
            message={
              <Typography.Text>
                {t(
                  "Supervisors will be deleted from the locations they belong to."
                )}{" "}
                <a href="#" target="_blank">
                  {t("Learn more")}
                </a>
              </Typography.Text>
            }
          />
          <Form
            onFinish={onSupervisorFormFinish}
            disabled={loading}
            css={{ width: 300 }}
            autoComplete="off"
          >
            <Form.Item
              required
              name="name"
              rules={[
                {
                  required: true,
                  message: "",
                },
                {
                  max: 20,
                  message: t("Name must be 20 characters or less"),
                },
              ]}
            >
              <Input placeholder={t("Name")} maxLength={20} showCount />
            </Form.Item>
            <Form.Item
              required
              name="lastName"
              rules={[
                {
                  required: true,
                  message: "",
                },
                {
                  max: 20,
                  message: t("Last Name must be 20 characters or less"),
                },
              ]}
            >
              <Input placeholder={t("Last Name")} maxLength={20} showCount />
            </Form.Item>
            <Form.Item
              required
              name="email"
              rules={[
                {
                  required: true,
                  message: "",
                },
                { type: "email", message: t("Must be a valid email") },
                {
                  validator(_, value) {
                    if (value && value === Auth.currentUser.email) {
                      return Promise.reject(
                        new Error(t("You can't be a supervisor"))
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="email" placeholder={t("Email")} maxLength={255} />
            </Form.Item>

            <Form.Item>
              <Button block htmlType="submit" type="primary">
                {t("Next")}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button block type="primary" danger onClick={() => navigate(-1)}>
                {t("Cancel")}
              </Button>
            </Form.Item>
          </Form>
        </React.Fragment>
      ) : (
        step === 2 && (
          <Layout css={{ width: "100%" }}>
            <Typography.Text
              type="secondary"
              css={{ fontSize: 18, alignSelf: "center", margin: "10px" }}
            >
              {t("What Locations will {{0}} supervise?", {
                0: supervisorData?.name,
              })}
            </Typography.Text>

            <LocationsPicker
              selectedLocations={selectedLocations}
              onSelectionChange={setSelectedLocations}
              alreadySelected={[]}
            />

            <Layout.Footer css={{ justifyContent: "center", display: "flex" }}>
              <Space direction="vertical" css={{ width: 300 }}>
                <Alert
                  message={t("{{0}} Location(s) selected", {
                    0: Number(selectedLocations.length),
                  })}
                  type="warning"
                  showIcon
                />
                <Button
                  type="primary"
                  onClick={createSupervisor}
                  loading={loading}
                  block
                >
                  {t("Next")}
                </Button>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    setSelectedLocations([]);
                    setStep(1);
                  }}
                  block
                >
                  {t("Cancel")}
                </Button>
              </Space>
            </Layout.Footer>
          </Layout>
        )
      )}
    </Layout>
  );
}

export default NewSupervisor;
