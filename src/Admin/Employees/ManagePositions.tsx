/** @jsx jsx */
import { MinusCircleOutlined } from "@ant-design/icons";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { POSITIONS } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import {
  Button,
  Divider,
  Drawer,
  DrawerProps,
  Input,
  List,
  Typography,
} from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import { matchSorter } from "match-sorter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

function ManagePositions(props: DrawerProps) {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [addingPosition, setAddingPosition] = useState(false);
  const [fieldValue, setFieldValue] = useState("");

  const addPosition = async (position: string) => {
    if (!position) {
      return;
    }
    setAddingPosition(true);
    try {
      await location.addPosition(position);
      setFieldValue("");
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "add_position", {
        position,
      });
    } catch (error) {
      recordError(error);
    }
    setAddingPosition(false);
  };

  const removePosition = async (position: string) => {
    try {
      await location.removePosition(position);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Drawer {...props} title={t("Manage Positions")} placement="right">
      <Input.Search
        placeholder={t("New Position")}
        value={fieldValue}
        onChange={(e) => setFieldValue(e.target.value)}
        allowClear
        enterButton={t("Add")}
        size="large"
        onSearch={addPosition}
        loading={addingPosition}
        disabled={location.positions?.length >= 20}
        maxLength={40}
        showCount
      />

      <Divider orientation="left">{t("Custom Positions")}</Divider>
      <List
        size="small"
        dataSource={matchSorter(location.positions, "")}
        renderItem={(pos) => (
          <List.Item
            key={pos}
            extra={
              <Button
                danger
                icon={<MinusCircleOutlined />}
                type="link"
                onClick={() => removePosition(pos)}
              />
            }
          >
            <Typography.Text>{pos}</Typography.Text>
          </List.Item>
        )}
      />
      <Divider orientation="left">{t("Default Positions")}</Divider>
      <List
        css={{ overflowY: "auto" }}
        size="small"
        dataSource={matchSorter(POSITIONS, "")}
        renderItem={(pos) => (
          <List.Item key={pos}>
            <Typography.Text>{pos}</Typography.Text>
          </List.Item>
        )}
      />
    </Drawer>
  );
}

export default ManagePositions;
