/** @jsx jsx */
import { MinusCircleOutlined } from "@ant-design/icons";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library";
import { POSITIONS } from "@cuttinboard-solutions/types-helpers";
import { jsx } from "@emotion/react";
import {
  Button,
  Divider,
  Drawer,
  DrawerProps,
  Form,
  Input,
  List,
  Typography,
} from "antd";
import { compact } from "lodash";
import { matchSorter } from "match-sorter";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { logAnalyticsEvent } from "../../firebase";

function ManagePositions(props: DrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ position: string }>();
  const { location, addPosition, removePosition } = useCuttinboardLocation();

  const handleAddPosition = useCallback(
    ({ position }: { position: string }) => {
      addPosition(position);
      form.resetFields();
      logAnalyticsEvent("location_position_created", {
        position,
      });
    },
    [addPosition, form]
  );

  return (
    <Drawer {...props} title={t("Manage Positions")} placement="right">
      <Form
        initialValues={{ position: "" }}
        onFinish={handleAddPosition}
        autoComplete="off"
        form={form}
      >
        <Form.Item
          name="position"
          rules={[
            {
              required: true,
              message: t("Please enter a position"),
            },
            {
              // Verify that the position is not already in the list
              validator: async (_, value: string) => {
                if (
                  value &&
                  compact([
                    ...(location.settings?.positions ?? []),
                    ...POSITIONS,
                  ]).some((pos) => {
                    return pos.toLowerCase() === value.toLowerCase();
                  })
                ) {
                  return Promise.reject(
                    new Error(t("Position already exists"))
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          validateTrigger="onSubmit"
        >
          <Input.Search
            placeholder={t("New Position")}
            allowClear
            enterButton={t("Add")}
            size="large"
            onSearch={form.submit}
            disabled={
              location.settings?.positions &&
              location.settings.positions?.length >= 20
            }
            maxLength={40}
            showCount
          />
        </Form.Item>
      </Form>

      <Divider orientation="left">{t("Custom Positions")}</Divider>
      <List
        size="small"
        dataSource={
          location.settings?.positions
            ? matchSorter(location.settings.positions, "")
            : []
        }
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
