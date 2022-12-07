import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Space, Tag } from "antd";

export const OwnerGoldContainer = styled(Tag)`
  color: #ffffff;
  background: radial-gradient(
      ellipse farthest-corner at right bottom,
      #fedb37 0%,
      #fdb931 8%,
      #9f7928 30%,
      #8a6e2f 40%,
      transparent 80%
    ),
    radial-gradient(
      ellipse farthest-corner at left top,
      #ffffff 0%,
      #ffffac 8%,
      #d1b464 25%,
      #5d4a1f 62.5%,
      #5d4a1f 100%
    );
`;

export const NormalContainer = styled(Space)`
  margin: 10px;
  padding: 10px;
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${Colors.MainBlue};
`;
