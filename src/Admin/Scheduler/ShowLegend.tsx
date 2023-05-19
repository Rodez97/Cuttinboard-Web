/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library";
import { Modal } from "antd/es";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import mdiSquare from "@mdi/svg/svg/square-rounded.svg";
import i18next from "i18next";
import mdiComment from "@mdi/svg/svg/comment-quote-outline.svg";

const elementStyle = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
`;

export default () => {
  Modal.info({
    title: i18next.t("Legend").toString(),
    content: (
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
        }}
      >
        <div css={elementStyle}>
          <Icon
            component={mdiSquare}
            css={{
              color: Colors.MainBlue,
              fontSize: "1.5em",
            }}
          />
          {" " + i18next.t("Published").toString()}
        </div>
        <div css={elementStyle}>
          <Icon
            component={mdiSquare}
            css={{
              color: "#505050",
              fontSize: "1.5em",
            }}
          />
          {" " + i18next.t("Pending publishing").toString()}
        </div>
        <div css={elementStyle}>
          <Icon
            component={mdiSquare}
            css={{
              color: "#f33d61",
              fontSize: "1.5em",
            }}
          />
          {" " + i18next.t("Pending deletion").toString()}
        </div>
        <div css={elementStyle}>
          <Icon
            component={mdiClockAlert}
            css={{
              color: Colors.Error.errorMain,
              fontSize: "1.5em",
            }}
          />
          {" " + i18next.t("Overtime").toString()}
        </div>
        <div css={elementStyle}>
          <Icon component={mdiComment} css={{ fontSize: "1.5em" }} />
          {" " + i18next.t("Notes").toString()}
        </div>
      </div>
    ),
  });
};
