/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, List, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { ArrowRightOutlined } from "@ant-design/icons";
import {
  Colors,
  useCuttinboard,
  useCuttinboardLocation,
  useDirectMessageChat,
} from "@cuttinboard-solutions/cuttinboard-library";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import { IEmployee } from "@cuttinboard-solutions/types-helpers";

type Props = {
  onCreatingChange: (status: boolean) => void;
  onClose: () => void;
};

export default function NewDMByEmployee({ onCreatingChange, onClose }: Props) {
  const { t } = useTranslation();
  const { startNewDirectMessageChat } = useDirectMessageChat();
  const { employees } = useCuttinboardLocation();
  const { user } = useCuttinboard();

  const startNewChat = (selectedUser: IEmployee) => {
    try {
      onCreatingChange(true);
      startNewDirectMessageChat(selectedUser);
      onClose();
    } catch (error) {
      recordError(error);
    } finally {
      onCreatingChange(false);
    }
  };
  return (
    <div>
      <Typography.Text type="secondary" css={{ fontSize: 18 }}>
        {t("With someone in this location")}
      </Typography.Text>
      <List
        css={{ marginTop: 10 }}
        dataSource={employees.filter(({ id }) => id !== user.uid)}
        renderItem={(emp) => (
          <List.Item
            key={emp.id}
            extra={
              <Button
                type="link"
                icon={<ArrowRightOutlined />}
                onClick={() => startNewChat(emp)}
              />
            }
            css={{
              backgroundColor: Colors.MainOnWhite,
              padding: "10px !important",
              margin: 5,
            }}
          >
            <List.Item.Meta
              avatar={<CuttinboardAvatar userId={emp.id} src={emp.avatar} />}
              title={`${emp.name} ${emp.lastName}`}
              description={emp.email}
            />
          </List.Item>
        )}
      />
    </div>
  );
}
