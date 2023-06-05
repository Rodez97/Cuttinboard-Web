import * as yup from "yup";
import type { ILocationAddress } from "@cuttinboard-solutions/types-helpers";

export const gmValidationSchema = yup.object().shape({
  name: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
});

export interface GMArgs {
  name: string;
  lastName: string;
  email: string;
}

export interface ILocationInfo {
  name: string;
  intId?: string;
  address?: ILocationAddress;
}

export type AddLocationFunctionArgs = {
  location: ILocationInfo;
  generalManager?: GMArgs;
  promo?: string;
};

export interface LocFormType extends ILocationInfo {
  generalManager?: GMArgs;
}
