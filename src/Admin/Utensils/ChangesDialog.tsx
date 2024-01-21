/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Colors } from "@rodez97/cuttinboard-library";
import { Avatar, Drawer, Empty, List, Space, Typography } from "antd/es";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { IUtensil } from "@rodez97/types-helpers";
import orderBy from "lodash-es/orderBy";

interface ChangesDialogProps {
  open: boolean;
  onClose: () => void;
  utensil: IUtensil;
}

function ChangesDialog({ open, onClose, utensil }: ChangesDialogProps) {
  const { t } = useTranslation();
  return (
    <Drawer
      open={open}
      title={
        <div>
          <Typography.Text strong>{utensil.name}</Typography.Text>
          <Typography.Text type="secondary">
            {" "}
            - {t("Latest changes")}
          </Typography.Text>
        </div>
      }
      onClose={onClose}
      width={500}
    >
      {utensil.changes && utensil.changes.length > 0 ? (
        <List
          dataSource={orderBy(utensil.changes, ["date"], ["desc"])}
          renderItem={(ut, index) => (
            <List.Item
              key={index}
              extra={
                <Typography.Text>
                  <p>{dayjs(ut.date).format("MM-DD-YYYY")}</p>
                  <p>{dayjs(ut.date).format("h:mm a")}</p>
                </Typography.Text>
              }
            >
              <List.Item.Meta
                title={ut.reason ?? "---"}
                css={{
                  "& .ant-list-item-meta-title": {
                    paddingRight: 15,
                  },
                }}
                description={ut.user.userName}
                avatar={
                  <Space direction="vertical" align="center">
                    <Typography.Text strong>
                      {ut.quantity > 0 ? `+${ut.quantity}` : ut.quantity}
                    </Typography.Text>
                    <Avatar
                      css={{ backgroundColor: Colors.MainOnWhite }}
                      icon={
                        ut.quantity > 0 ? (
                          <ArrowUpOutlined
                            style={{ color: Colors.Success.successMain }}
                          />
                        ) : ut.quantity < 0 ? (
                          <ArrowDownOutlined
                            style={{ color: Colors.Error.errorMain }}
                          />
                        ) : (
                          <MinusOutlined />
                        )
                      }
                    />
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description={t("No recent changes")} />
      )}
    </Drawer>
  );
}

export default ChangesDialog;
