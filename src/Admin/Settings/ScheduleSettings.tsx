/* eslint-disable @typescript-eslint/no-explicit-any */
/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import {
  Button,
  Divider,
  Drawer,
  DrawerProps,
  Form,
  InputNumber,
  message,
  Space,
  TimePicker,
} from "antd/es";
import { useTranslation } from "react-i18next";
import { Checkbox } from "antd/es";
import {
  MinusCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import moment from "moment";
import compact from "lodash-es/compact";
import isEqual from "lodash-es/isEqual";
import { useCuttinboardLocation } from "@rodez97/cuttinboard-library";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

type ScheduleFormData = {
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

function ScheduleSettings(props: DrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ScheduleFormData>();
  const { updateScheduleSettings, scheduleSettings } = useCuttinboardLocation();

  const onFinish = async (values: ScheduleFormData) => {
    // Convert presetTimes to strings
    const presetTimes = values.presetTimes?.map((time) => ({
      start: time.start.format("HH:mm"),
      end: time.end.format("HH:mm"),
    }));

    await updateScheduleSettings({ ...values, presetTimes });

    message.success(t("Schedule settings saved"));

    logAnalyticsEvent("schedule_settings_updated", values);
  };

  return (
    <Drawer {...props} title={t("Schedule settings")} placement="right">
      <Form<ScheduleFormData>
        form={form}
        css={{ gap: 8 }}
        initialValues={{
          ...scheduleSettings,
          presetTimes: scheduleSettings.presetTimes?.map(
            (time: { start: string; end: string }) => ({
              start: moment(time.start, "HH:mm"),
              end: moment(time.end, "HH:mm"),
            })
          ),
        }}
        onFinish={onFinish}
      >
        <Divider>{t("OVERTIME")}</Divider>

        <Button
          type="link"
          href="http://www.cuttinboard.com/help/overtime"
          target="_blank"
          icon={<QuestionCircleOutlined />}
          css={{ marginBottom: 8 }}
        >
          {t("How overtime works?")}
        </Button>

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
              value: ScheduleFormData["ot_week"]["enabled"],
              _,
              all: ScheduleFormData
            ) => {
              // If the weekly overtime is enabled and the daily overtime is enabled, disable the daily overtime
              if (value && all.ot_day?.enabled) {
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
              formatter={(value) => t(`{{0}} hours`, { 0: value })}
              parser={(value) => {
                if (!value) return 0;
                const hours = value.split(" ")[0];
                return parseInt(hours) as any;
              }}
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
              max={10}
              step={0.1}
              formatter={(value) => `${value}x`}
              parser={(value) => {
                if (!value) return 0;
                const multiplier = value.replace("x", "");
                return parseFloat(multiplier) as any;
              }}
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
              value: ScheduleFormData["ot_day"]["enabled"],
              _,
              all: ScheduleFormData
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
              parser={(value) => {
                if (!value) return 0;
                const hours = value.replace(" hours", "");
                return parseInt(hours) as any;
              }}
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
              max={10}
              step={0.1}
              formatter={(value) => `${value}x`}
              parser={(value) => {
                if (!value) return 0;
                const multiplier = value.replace("x", "");
                return parseFloat(multiplier) as any;
              }}
            />
          </Form.Item>
        </Space>

        <Divider>{t("PRESET TIMES")}</Divider>

        <Form.List
          name="presetTimes"
          rules={[
            {
              validator: async (
                _,
                presetTimes: ScheduleFormData["presetTimes"]
              ) => {
                // Limit the number of preset times to 10
                if (presetTimes && presetTimes.length > 10) {
                  return Promise.reject(
                    new Error(t("You can only have up to 10 preset times"))
                  );
                } else {
                  return Promise.resolve();
                }
              },
            },
          ]}
        >
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
                    rules={[{ required: true, message: t("Missing start") }]}
                    trigger="onSelect"
                  >
                    <TimePicker
                      format="hh:mm a"
                      minuteStep={5}
                      use12Hours
                      allowClear={false}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "end"]}
                    key="end"
                    rules={[{ required: true, message: t("Missing end") }]}
                    trigger="onSelect"
                  >
                    <TimePicker
                      format="hh:mm a"
                      minuteStep={5}
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
                  disabled={fields.length >= 10}
                >
                  {t("Add preset time")}
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>

        <Form.Item shouldUpdate>
          {({ getFieldValue }) => {
            // Get OT Week
            const otWeek: ScheduleFormData["ot_week"] = getFieldValue([
              "ot_week",
            ]);
            // Get OT Day
            const otDay: ScheduleFormData["ot_day"] = getFieldValue(["ot_day"]);
            // Get Preset Times
            const presetTimes: {
              start: moment.Moment;
              end: moment.Moment;
            }[] = getFieldValue(["presetTimes"]) ?? [];
            // Compare otWeek to initialValues
            const otWeekChanged = !isEqual(otWeek, scheduleSettings.ot_week);
            // Compare otDay to initialValues
            const otDayChanged = !isEqual(otDay, scheduleSettings.ot_day);
            // Compare presetTimes to initialValues
            const presetTimesToString = compact(presetTimes).map(
              ({
                start,
                end,
              }: {
                start?: moment.Moment;
                end?: moment.Moment;
              }) => ({
                start: start?.format("HH:mm"),
                end: end?.format("HH:mm"),
              })
            );

            let presetTimesChanged = false;

            if (
              presetTimesToString.length !==
              scheduleSettings.presetTimes?.length
            ) {
              presetTimesChanged = true;
            } else {
              const sortedPresetTimesToString = presetTimesToString.sort();
              const sortedPresetTimes = [
                ...scheduleSettings.presetTimes,
              ].sort();
              presetTimesChanged = !isEqual(
                sortedPresetTimesToString,
                sortedPresetTimes
              );
            }

            // If any of the values have changed, enable the submit button
            const submitEnabled =
              otWeekChanged || otDayChanged || presetTimesChanged;
            return (
              <Button
                htmlType="submit"
                block
                type="primary"
                icon={<SaveOutlined />}
                // Shake the button if there are changes
                css={[submitEnabled ? ShakeCss : {}, { marginTop: 20 }]}
                // Disable the button if there are no changes
                disabled={!submitEnabled}
              >
                {t("Save")}
              </Button>
            );
          }}
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default ScheduleSettings;
