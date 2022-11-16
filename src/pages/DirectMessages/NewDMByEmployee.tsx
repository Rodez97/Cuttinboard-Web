/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useDMs,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Avatar, Button, List, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { ArrowRightOutlined, UserOutlined } from "@ant-design/icons";

function NewDMByEmployee({
  onCreatingChange,
  onClose,
}: {
  onCreatingChange: (status: boolean) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { startNewLocationDM } = useDMs();
  const { getEmployees } = useEmployeesList();

  const startNewChat = async (selectedUser: Employee) => {
    try {
      onCreatingChange(true);
      await startNewLocationDM(selectedUser);
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
        dataSource={getEmployees.filter(
          ({ id }) => id !== Auth.currentUser.uid
        )}
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
            css={{ backgroundColor: "#F7F7F7", padding: 10, marginBottom: 8 }}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} src={emp.avatar} />}
              title={`${emp.name} ${emp.lastName}`}
              description={emp.email}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default NewDMByEmployee;
