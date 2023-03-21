import { UtensilsProvider } from "@cuttinboard-solutions/cuttinboard-library";
import React from "react";
import usePageTitle from "../../hooks/usePageTitle";
import Utensils from "./Utensils";

export default () => {
  usePageTitle("Utensils");

  return (
    <UtensilsProvider>
      <Utensils />
    </UtensilsProvider>
  );
};
