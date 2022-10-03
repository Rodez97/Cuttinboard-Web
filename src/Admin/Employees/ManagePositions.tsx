/** @jsx jsx */
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
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
import React from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "utils/utils";

function ManagePositions(props: DrawerProps) {
  const { t } = useTranslation();
  const { location } = useLocation();

  const addPosition = async (position: string) => {
    try {
      await location.addPosition(position);
    } catch (error) {
      recordError(error);
    }
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
        allowClear
        enterButton={t("Add")}
        size="large"
        onSearch={addPosition}
      />

      <Divider orientation="left">{t("Custom Positions")}</Divider>
      <List
        size="small"
        dataSource={location.positions}
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
        dataSource={Positions}
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
