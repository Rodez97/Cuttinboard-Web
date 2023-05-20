import { Checkbox, Col, Row } from "antd/es";
import dayjs from "dayjs";
import React from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";
dayjs.extend(isoWeek);

interface WeekdaysPickerProps {
  onChange: (values: number[]) => void;
  value: number[];
  baseDay: number;
}
export const WEEKDAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 7 },
];

function WeekdaysPicker({ onChange, value, baseDay }: WeekdaysPickerProps) {
  const { t } = useTranslation();

  return (
    <Checkbox.Group name="applyTo" onChange={onChange} value={value}>
      <Row>
        {WEEKDAYS.map(({ label, value }) => (
          <Col xs={12} sm={8} key={value}>
            <Checkbox value={value} disabled={Boolean(value === baseDay)}>
              {t(label)}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
}

export default WeekdaysPicker;
