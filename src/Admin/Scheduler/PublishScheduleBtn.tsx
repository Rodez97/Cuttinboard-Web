import { UploadOutlined } from "@ant-design/icons";
import { useDisclose, useUpdatesCount } from "@rodez97/cuttinboard-library";
import { Button, Tooltip } from "antd/es";
import React, { lazy } from "react";
import { useTranslation } from "react-i18next";

const PublishDialog = lazy(() => import("./PublishDialog"));

function PublishScheduleBtn() {
  const { t } = useTranslation();
  const [publishDialogOpen, openPublish, closePublish] = useDisclose();
  const updatesCount = useUpdatesCount();

  return (
    <>
      <Tooltip
        title={
          updatesCount.total === 0
            ? t("You can't publish schedules with no changes")
            : ""
        }
        key="1"
      >
        <Button
          icon={<UploadOutlined />}
          onClick={openPublish}
          type="primary"
          disabled={updatesCount.total === 0}
        >
          {`${t("Publish")} (${updatesCount.total})`}
        </Button>
      </Tooltip>

      <PublishDialog
        open={publishDialogOpen}
        onCancel={closePublish}
        onAccept={closePublish}
      />
    </>
  );
}

export default PublishScheduleBtn;
