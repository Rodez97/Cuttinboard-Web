/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Divider, Input, Layout, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { useOwner } from "../OwnerPortal/OwnerPortal";
import { differenceBy } from "lodash";
import { customOrderSorter } from "../OwnerPortal/customOrderSorter";
import { LocationsPickerOption } from "./LocationsPickerOption";
import { SplitButton } from "../../components";

function LocationsPicker({
  selectedLocations,
  onSelectionChange,
  alreadySelected,
}: {
  selectedLocations: Location[];
  onSelectionChange: (locs: Location[]) => void;
  alreadySelected: Location[];
}) {
  const { t } = useTranslation();
  const [{ order, index }, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
  }>({
    index: 0,
    order: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { locations } = useOwner();

  const handleLocSelection = (loc: Location) => {
    const locIndex = selectedLocations.indexOf(loc);
    if (locIndex > -1) {
      const { [locIndex]: removed, ...rest } = selectedLocations;
      onSelectionChange(Array.from(rest));
    } else {
      onSelectionChange([...selectedLocations, loc]);
    }
  };

  const getOrderedLocations = useMemo(() => {
    const aviableLocations = differenceBy(locations, alreadySelected, "id");
    switch (index) {
      case 0:
        return matchSorter(aviableLocations, searchQuery, {
          keys: ["name"],
          baseSort: customOrderSorter(order),
        });
      case 1:
        return matchSorter(aviableLocations, searchQuery, {
          keys: ["address.city"],
          baseSort: customOrderSorter(order),
        });
      case 2:
        return matchSorter(aviableLocations, searchQuery, {
          keys: ["intId"],
          baseSort: customOrderSorter(order),
        });
      default:
        return aviableLocations;
    }
  }, [locations, index, order, searchQuery]);

  return (
    <Layout.Content
      css={{
        border: "1px solid #00000025",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      <Space
        wrap
        size="large"
        css={{ display: "flex", justifyContent: "space-between" }}
      >
        <SplitButton
          options={[t("Name"), t("City"), t("ID")]}
          selectedIndex={index}
          order={order}
          onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
          onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        />
        <Input.Search
          placeholder={t("Search")}
          css={{ width: 250 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          allowClear
        />
      </Space>

      <Divider />

      <div css={{ overflow: "auto", flex: 1 }}>
        <Space wrap size="large">
          {Boolean(getOrderedLocations.length) ? (
            getOrderedLocations?.map((loc) => (
              <LocationsPickerOption
                key={loc.id}
                location={loc}
                selected={selectedLocations.indexOf(loc) > -1}
                onSelectChange={handleLocSelection}
              />
            ))
          ) : (
            <Typography.Text type="secondary">
              {t("No aviable positions to select.")}
            </Typography.Text>
          )}
        </Space>
      </div>
    </Layout.Content>
  );
}

export default LocationsPicker;
