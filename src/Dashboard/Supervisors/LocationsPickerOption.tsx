/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Card, Checkbox, Typography } from "antd";
import { useTranslation } from "react-i18next";

export const LocationsPickerOption = ({
  location,
  selected,
  onSelectChange,
}: {
  location: Location;
  selected: boolean;
  onSelectChange: (location: Location) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Card
      css={{ width: 270 }}
      title={location.name}
      extra={[
        <Checkbox
          key="check"
          checked={selected}
          onChange={(e) => onSelectChange(location)}
        />,
      ]}
    >
      <Card.Meta
        description={
          <Typography.Text>
            {t("City: {{0}}", { 0: location.address?.city })}
            <br />
            {t("ID: {{0}}", { 0: location.intId })}
          </Typography.Text>
        }
      />
    </Card>
  );
};
