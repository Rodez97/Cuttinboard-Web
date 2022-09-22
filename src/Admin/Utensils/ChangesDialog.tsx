import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Timestamp } from "@firebase/firestore";
import { Avatar, Button, Empty, List, Modal, Typography } from "antd";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";

interface ChangesDialogProps {
  open: boolean;
  onClose: () => void;
  utensil: Utensil;
}

function ChangesDialog({ open, onClose, utensil }: ChangesDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={open}
      title={t("Changes")}
      onCancel={onClose}
      footer={[
        <Button type="primary" onClick={onClose}>
          OK
        </Button>,
      ]}
    >
      {utensil?.changes?.length > 0 ? (
        <List
          dataSource={utensil?.changes}
          renderItem={(ut, index) => (
            <List.Item
              key={index}
              actions={[
                <Typography.Text>
                  {dayjs((ut.date as Timestamp)?.toDate()).format("MM-DD-YYYY")}
                </Typography.Text>,
              ]}
            >
              <List.Item.Meta
                title={ut.quantity}
                description={ut?.reason}
                avatar={
                  <Avatar
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
