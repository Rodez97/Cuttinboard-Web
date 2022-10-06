/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import dayjs from "dayjs";
import { useCallback } from "react";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Card } from "antd";
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface EmpColumnCellProps {
  employee: Employee;
  shifts?: Shift[];
}

function EmpColumnCell({ employee, shifts }: EmpColumnCellProps) {
  const getSecondaryText = useCallback(() => {
    const durationTotal = shifts?.reduce<{
      time: duration.Duration;
      wage: number;
    }>(
      (acc, shift) => {
        const { time, wage } = acc;
        return {
          time: time.add(shift.shiftDuration.totalMinutes, "minutes"),
          wage: wage + shift.getWage,
        };
      },
      { time: dayjs.duration(0), wage: 0 }
    ) ?? { time: dayjs.duration(0), wage: 0 };
    const totalTime = durationTotal?.time?.asHours().toString().split(".");
    const hours = `${totalTime?.[0] ?? "0"}h`;
    const minutes = `${60 * (Number.parseInt(totalTime?.[1] ?? "0") / 10)}min`;
    return `${hours} ${minutes} - ${durationTotal.wage.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}`;
  }, [shifts]);

  return (
    <Card bordered={false} css={{ zIndex: 2 }}>
      <Card.Meta
        avatar={<QuickUserDialogAvatar employee={employee} />}
        title={`${employee.name} ${employee.lastName}`}
        description={getSecondaryText()}
      />
    </Card>
  );
}

export default EmpColumnCell;
