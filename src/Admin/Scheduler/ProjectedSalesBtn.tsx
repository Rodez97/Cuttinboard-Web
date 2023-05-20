import { FundProjectionScreenOutlined } from "@ant-design/icons";
import { Button } from "antd/es";
import React, { lazy, useState } from "react";
import { useTranslation } from "react-i18next";

const ProjectedSalesDialog = lazy(() => import("./ProjectedSalesDialog"));

function ProjectedSalesBtn() {
  const { t } = useTranslation();
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  return (
    <>
      <Button
        key="projectedSales"
        onClick={() => setProjectedSalesOpen(true)}
        type="dashed"
        icon={<FundProjectionScreenOutlined />}
      >
        {t("Projected Sales")}
      </Button>
      <ProjectedSalesDialog
        visible={projectedSalesOpen}
        onClose={() => setProjectedSalesOpen(false)}
      />
    </>
  );
}

export default ProjectedSalesBtn;
