/** @jsx jsx */
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { jsx } from "@emotion/react";
import {
  Descriptions,
  message,
  Modal,
  ModalProps,
  Select,
  Space,
  Typography,
} from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

export default (props: ModalProps & { onAccept: () => void }) => {
  const { t } = useTranslation();
  const { publish, updates, weekSummary } = useSchedule();
  const [notifyTo, setNotifyTo] = useState<
    "all" | "all_scheduled" | "changed" | "none"
  >("changed");

  const handlePublish = async () => {
    try {
      await publish(notifyTo ?? "changed");
      message.success(t("Changes Published"));
      // Report to analytics
      logEvent(getAnalytics(), "publish_schedule", {
        notifyTo: notifyTo,
        ...weekSummary,
      });
      props.onAccept();
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Modal
      {...props}
      title={t("Publish schedule changes")}
      onOk={handlePublish}
    >
      <Space direction="vertical" css={{ display: "flex" }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={t("New or Draft:")}>
            {updates.newOrDraft}
          </Descriptions.Item>

          <Descriptions.Item label={t("Shift Updates:")}>
            {updates.pendingUpdates}
          </Descriptions.Item>

          <Descriptions.Item label={t("Deleted Shifts:")}>
            {updates.deleted}
          </Descriptions.Item>

          <Descriptions.Item label={t("Total Changes:")}>
            {updates.total}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Title level={5}>{t("Notify to:")}</Typography.Title>

        <Select
          onChange={(e: "all" | "all_scheduled" | "changed" | "none") => {
            setNotifyTo(e);
          }}
          value={notifyTo}
          defaultValue="changed"
          css={{ width: "100%" }}
        >
          <Select.Option value="all">{t("All")}</Select.Option>
          <Select.Option value="all_scheduled">
            {t("all_scheduled")}
          </Select.Option>
          <Select.Option value="changed">{t("changed")}</Select.Option>
          <Select.Option value="none">{t("None")}</Select.Option>
        </Select>
      </Space>
    </Modal>
  );
};
