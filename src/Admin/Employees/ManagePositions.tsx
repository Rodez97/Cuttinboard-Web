/** @jsx jsx */
import { MinusCircleOutlined } from "@ant-design/icons";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Positions } from "@cuttinboard-solutions/cuttinboard-library/utils";
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
import { matchSorter } from "match-sorter";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

function ManagePositions(props: DrawerProps) {
  const { t } = useTranslation();
  const { location } = useLocation();
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
        dataSource={matchSorter(Positions, "")}
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
