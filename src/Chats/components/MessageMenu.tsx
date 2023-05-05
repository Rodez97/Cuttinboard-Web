/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import {
  useCuttinboard,
  useMessages,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IMessage } from "@cuttinboard-solutions/types-helpers";
import { Button, Dropdown, Modal, Typography } from "antd";
import dayjs from "dayjs";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(LocalizedFormat);

interface MessageMenuProps {
  currentMessage: IMessage;
  canUse?: boolean;
}

export default ({ currentMessage, canUse }: MessageMenuProps) => {
  const { t } = useTranslation();
  const { removeMessage } = useMessages();
  const { user } = useCuttinboard();

  const deleteMessage = useCallback(() => {
    // Confirm delete
    Modal.confirm({
      title: t("Are you sure you want to delete this message?"),
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        removeMessage(currentMessage);
      },
    });
  }, [currentMessage, removeMessage, t]);

  return (
    <div>
      <Typography.Text
        type="secondary"
        css={{
          fontSize: 12,
          marginRight: 8,
        }}
      >
        {dayjs(currentMessage.createdAt).format("L LT")}
      </Typography.Text>
      {canUse && user.uid === currentMessage.user._id && (
        <Dropdown
          menu={{
            items: [
              {
                label: t("Delete"),
                key: "deleteMessage",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  deleteMessage();
                },
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Dropdown>
      )}
    </div>
  );
};
