/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, { BorderOutlined } from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Modal } from "antd";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import i18next from "i18next";

export default () => {
  Modal.info({
    title: i18next.t("Legend").toString(),
    content: (
      <div>
        <p>
          <BorderOutlined
            css={{
              color: Colors.MainBlue,
            }}
          />
          {" " + i18next.t("Published").toString()}
        </p>
        <p>
          <BorderOutlined
            css={{
              color: "#505050",
            }}
          />
          {" " + i18next.t("Pending publishing").toString()}
        </p>
        <p>
          <BorderOutlined
            css={{
              color: "#f33d61",
            }}
          />
          {" " + i18next.t("Pending deletion").toString()}
        </p>
        <p>
          <Icon
            component={mdiClockAlert}
            css={{
              color: Colors.Error.errorMain,
            }}
          />
          {" " + i18next.t("Overtime").toString()}
        </p>
      </div>
    ),
  });
};
