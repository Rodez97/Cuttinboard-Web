/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Modal } from "antd";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import mdiSquare from "@mdi/svg/svg/square-rounded.svg";
import i18next from "i18next";

export default () => {
  Modal.info({
    title: i18next.t("Legend").toString(),
    content: (
      <div>
        <p>
          <Icon
            component={mdiSquare}
            css={{
              color: Colors.MainBlue,
            }}
          />
          {" " + i18next.t("Published").toString()}
        </p>
        <p>
          <Icon
            component={mdiSquare}
            css={{
              color: "#505050",
            }}
          />
          {" " + i18next.t("Pending publishing").toString()}
        </p>
        <p>
          <Icon
            component={mdiSquare}
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
