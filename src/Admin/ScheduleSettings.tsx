/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Button,
  Divider,
  Form,
  InputNumber,
  Layout,
  Space,
  Switch,
  TimePicker,
  Typography,
} from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "antd";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, setDoc } from "firebase/firestore";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import PageError from "../components/PageError";
import PageLoading from "../components/PageLoading";
import { recordError } from "../utils/utils";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { isEqual } from "lodash";
import { GrayPageHeader } from "../components/PageHeaders";

type SecheduleFormData = {
  ot_week: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  ot_day: {
    enabled: boolean;
    hours: number;
    multiplier: number;
  };
  presetTimes?: {
    start: moment.Moment;
    end: moment.Moment;
  }[];
};

const ShakeCss = css`
  animation: shake 2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
  animation-iteration-count: infinite;

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
`;

// Funtion to calculate overtime from a shift
export function calculateOvertime(
  shift: number,
  ot_week: SecheduleFormData["ot_week"],
  ot_day: SecheduleFormData["ot_day"]
) {
  // Calculate overtime
  let overtime = 0;
  if (ot_week.enabled && shift > ot_week.hours) {
    overtime += (shift - ot_week.hours) * ot_week.multiplier;
  }
  if (ot_day.enabled && shift > ot_day.hours) {
    overtime += (shift - ot_day.hours) * ot_day.multiplier;
  }
  return overtime;
}

function ScheduleSettings() {
  const { t } = useTranslation();
  const [form] = Form.useForm<SecheduleFormData>();
  const { location } = useLocation();
  // Get Schedule Settings from Firestore
  const [scheduleSettingsData, loading, error] = useDocumentData(
    doc(
      Firestore,
      "Organizations",
      location.organizationId,
      "settings",
      `schedule_${location.id}`
    )
  );

  const onFinish = async (values: SecheduleFormData) => {
    // Convert presetTimes to strings
    const presetTimes = values.presetTimes?.map((time) => ({
      start: time.start.format("HH:mm"),
      end: time.end.format("HH:mm"),
    }));

    try {
      await setDoc(
        doc(
          Firestore,
          "Organizations",
          location.organizationId,
          "settings",
          `schedule_${location.id}`
        ),
        { ...values, presetTimes },
        { merge: true }
      );
    } catch (error) {
      recordError(error);
    }
  };

  // If there is an error, show it
  if (error) {
    return <PageError error={error} />;
  }

  // If the data is loading, show a loading message
  if (loading) {
    return <PageLoading />;
  }

  const initialValues: SecheduleFormData = {
    ot_week: {
      enabled: scheduleSettingsData?.ot_week?.enabled ?? false,
      hours: scheduleSettingsData?.ot_week?.hours ?? 40,
      multiplier: scheduleSettingsData?.ot_week?.multiplier ?? 1.5,
    },
    ot_day: {
      enabled: scheduleSettingsData?.ot_day?.enabled ?? false,
      hours: scheduleSettingsData?.ot_day?.hours ?? 8,
      multiplier: scheduleSettingsData?.ot_day?.multiplier ?? 1.5,
    },
    presetTimes: scheduleSettingsData?.presetTimes?.map(
      (time: { start: moment.MomentInput; end: moment.MomentInput }) => ({
        start: moment(time.start, "HH:mm"),
        end: moment(time.end, "HH:mm"),
      })
    ),
  };

  return (
    <Layout.Content>
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 270,
            maxWidth: 400,
            margin: "auto",
            width: "100%",
          }}
        >
          <Typography.Title css={{ textAlign: "center" }}>
            {t("Schedule settings")}
          </Typography.Title>
          <Form<SecheduleFormData>
            form={form}
            css={{ width: "100%", gap: 8 }}
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <Divider>{t("OVERTIME")}</Divider>

            {/* Weekly Overtime */}
            <Space
              direction="vertical"
              css={{
                border: "1px solid #00000025",
                padding: 5,
                width: "100%",
              }}
            >
              <Form.Item
                name={["ot_week", "enabled"]}
                valuePropName="checked"
                normalize={(
                  value: SecheduleFormData["ot_week"]["enabled"],
                  _,
                  all: SecheduleFormData
                ) => {
                  // If the weekly overtime is enabled and the daily overtime is enabled, disable the daily overtime
                  if (value && all.ot_day.enabled) {
                    form.setFieldValue(["ot_day", "enabled"], false);
                  }
                  return value;
                }}
              >
                <Checkbox>{t("Weekly overtime")}</Checkbox>
              </Form.Item>

              <Form.Item
                name={["ot_week", "hours"]}
                label={t("Calculate overtime after")}
                rules={[
                  {
                    required: true,
                    message: t("Please enter overtime"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={60}
                  formatter={(value) => `${value} hours`}
                />
              </Form.Item>

              <Form.Item
                name={["ot_week", "multiplier"]}
                label={t("Overtime multiplier")}
                rules={[
                  {
                    required: true,
                    message: t("Please enter overtime multiplier"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={60}
                  formatter={(value) => `${value}x`}
                />
              </Form.Item>
            </Space>

            {/* Daily Overtime */}
            <Space
              direction="vertical"
              css={{
                border: "1px solid #00000025",
                padding: 5,
                width: "100%",
                marginTop: 10,
              }}
            >
              <Form.Item
                name={["ot_day", "enabled"]}
                valuePropName="checked"
                normalize={(
                  value: SecheduleFormData["ot_day"]["enabled"],
                  _,
                  all: SecheduleFormData
                ) => {
                  // If the daily overtime is enabled and the weekly overtime is enabled, disable the weekly overtime
                  if (value && all.ot_week.enabled) {
                    form.setFieldValue(["ot_week", "enabled"], false);
                  }
                  return value;
                }}
              >
                <Checkbox>{t("Daily overtime")}</Checkbox>
              </Form.Item>

              <Form.Item
                name={["ot_day", "hours"]}
                label={t("Calculate overtime after")}
                rules={[
                  {
                    required: true,
                    message: t("Please enter overtime"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={60}
                  formatter={(value) => `${value} hours`}
                />
              </Form.Item>

              <Form.Item
                name={["ot_day", "multiplier"]}
                label={t("Overtime multiplier")}
                rules={[
                  {
                    required: true,
                    message: t("Please enter overtime multiplier"),
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={60}
                  formatter={(value) => `${value}x`}
                />
              </Form.Item>
            </Space>

            <Divider>{t("PRESET TIMES")}</Divider>

            <Form.List name="presetTimes">
              {(fields, { add, remove }) => (
                <div
                  css={{
                    alignSelf: "center",
                    justifySelf: "center",
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      align="baseline"
                      css={{
                        border: "1px solid #00000025",
                        padding: 5,
                        marginTop: 10,
                      }}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, "start"]}
                        key="start"
                        rules={[{ required: true, message: "Missing start" }]}
                        trigger="onSelect"
                      >
                        <TimePicker
                          format="hh:mm a"
                          minuteStep={15}
                          use12Hours
                          allowClear={false}
                        />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "end"]}
                        key="end"
                        rules={[{ required: true, message: "Missing end" }]}
                        trigger="onSelect"
                      >
                        <TimePicker
                          format="hh:mm a"
                          minuteStep={15}
                          use12Hours
                          allowClear={false}
                        />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("Add preset time")}
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>

            <Form.Item shouldUpdate>
              {() => {
                const hasChanges = !isEqual(
                  form.getFieldsValue(),
                  initialValues
                );
                return (
                  <Button
                    htmlType="submit"
                    block
                    type="primary"
                    icon={<SaveOutlined />}
                    // Shake the button if there are changes
                    css={[hasChanges ? ShakeCss : {}, { marginTop: 20 }]}
                    // Disable the button if there are no changes
                    disabled={!hasChanges}
                  >
                    {t("Save")}
                  </Button>
                );
              }}
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout.Content>
  );
}

export default ScheduleSettings;
