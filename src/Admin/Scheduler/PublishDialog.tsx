/** @jsx jsx */
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import {
  Descriptions,
  message,
  Modal,
  ModalProps,
  Radio,
  Space,
  Typography,
} from "antd";
import { ANALYTICS } from "firebase";
import { logEvent } from "firebase/analytics";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default (props: ModalProps & { onAccept: () => void }) => {
  const { t } = useTranslation();
  const { publish, updatesCount, weekSummary } = useSchedule();
  const [notifyTo, setNotifyTo] = useState<
    "all" | "all_scheduled" | "changed" | "none"
  >("changed");

  const handlePublish = () => {
    publish(notifyTo);
    message.success(t("Changes Published"));
    // Report to analytics
    logEvent(ANALYTICS, "publish_schedule", {
      notifyTo: notifyTo,
      ...weekSummary,
    });
    props.onAccept();
  };

  return (
    <Modal
      {...props}
      title={t("Publish schedule changes")}
      onOk={handlePublish}
      cancelText={t("Cancel")}
    >
      <Space direction="vertical" css={{ display: "flex" }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t("New or Draft:")}>
            {updatesCount.newOrDraft}
          </Descriptions.Item>

          <Descriptions.Item label={t("Shift Updates:")}>
            {updatesCount.pendingUpdates}
          </Descriptions.Item>

          <Descriptions.Item label={t("Deleted Shifts:")}>
            {updatesCount.deleted}
          </Descriptions.Item>

          <Descriptions.Item label={t("Total Changes:")}>
            {updatesCount.total}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Title level={5}>{t("Notify to:")}</Typography.Title>

        <Radio.Group
          value={notifyTo}
          onChange={(e) => {
            setNotifyTo(e.target.value);
          }}
          css={{ width: "100%" }}
        >
          <Space direction="vertical">
            <Radio value="all">{t("Notify all employees")}</Radio>
            <Radio value="all_scheduled">
              {t("Notify only employees with scheduled shifts")}
            </Radio>
            <Radio value="changed">
              {t("Notify only employees whose shifts have changed")}
            </Radio>
            <Radio value="none">
              {t("Do not notify anyone about shift changes")}
            </Radio>
          </Space>
        </Radio.Group>
      </Space>
    </Modal>
  );
};
