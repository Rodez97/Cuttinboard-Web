/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Avatar, Button, Empty, List, Modal, Space, Typography } from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/utensils";

interface ChangesDialogProps {
  open: boolean;
  onClose: () => void;
  utensil: Utensil;
}

function ChangesDialog({ open, onClose, utensil }: ChangesDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      title={t("Changes")}
      onCancel={onClose}
      footer={[
        <Button type="primary" onClick={onClose} key="close">
          OK
        </Button>,
      ]}
    >
      {utensil.changes && utensil.changes.length > 0 ? (
        <List
          dataSource={utensil.orderedChanges}
          renderItem={(ut, index) => (
            <List.Item
              key={index}
              extra={
                <Typography.Text>
                  <p>{dayjs(ut.date.toDate()).format("MM-DD-YYYY")}</p>
                  <p>{dayjs(ut.date.toDate()).format("h:mm a")}</p>
                </Typography.Text>
              }
            >
              <List.Item.Meta
                title={ut.reason ?? "---"}
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
    </Modal>
  );
}

export default ChangesDialog;
