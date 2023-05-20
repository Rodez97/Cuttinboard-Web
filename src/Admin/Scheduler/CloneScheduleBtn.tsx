import { ScheduleOutlined } from "@ant-design/icons";
import { Button } from "antd/es";
import React, { lazy, useState } from "react";
import { useTranslation } from "react-i18next";

const CloneSchedule = lazy(() => import("./CloneSchedule"));

function CloneScheduleBtn() {
  const { t } = useTranslation();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);

  return (
    <>
      <Button
        key="clone"
        onClick={() => setCloneDialogOpen(true)}
        type="dashed"
        icon={<ScheduleOutlined />}
      >
        {t("Clone Schedule")}
      </Button>
      <CloneSchedule
        open={cloneDialogOpen}
        onCancel={() => setCloneDialogOpen(false)}
      />
    </>
  );
}

export default CloneScheduleBtn;
