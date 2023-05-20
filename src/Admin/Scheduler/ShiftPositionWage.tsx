/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  IEmployee,
  getEmployeeHourlyWage,
} from "@cuttinboard-solutions/types-helpers";
import { Tag, Typography } from "antd/es";
import { useTranslation } from "react-i18next";
import { useLocationPermissions } from "@cuttinboard-solutions/cuttinboard-library";

function ShiftPositionWage({
  employee,
  position,
}: {
  employee: IEmployee;
  position?: string;
}) {
  const { t } = useTranslation();
  const checkPermission = useLocationPermissions();
  const hWage = position ? getEmployeeHourlyWage(employee, position) : 0;

  if (!checkPermission("seeWages")) {
    return null;
  }

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography.Text>{t("Hourly Wage")}:</Typography.Text>
      <Tag color={hWage > 0 ? "processing" : "error"}>
        {hWage.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }) + "/hr"}
      </Tag>
    </div>
  );
}

export default ShiftPositionWage;
