/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Card,
  Checkbox,
  Divider,
  Input,
  Layout,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import SplitButton from "../../components/SplitButton";
import { useMemo, useState } from "react";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useOwner } from "../OwnerPortal/OwnerPortal";
import { customOrderSorter } from "Dashboard/OwnerPortal/customOrderSorter";

function LocationsPicker({
  selectedLocations,
  onSelectionChange,
}: {
  selectedLocations: Location[];
  onSelectionChange: (locs: Location[]) => void;
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
    switch (index) {
      case 0:
        return matchSorter(locations, searchQuery, {
          keys: ["name"],
          baseSort: customOrderSorter(order),
        });
      case 1:
        return matchSorter(locations, searchQuery, {
          keys: ["address.city"],
          baseSort: customOrderSorter(order),
        });
      case 2:
        return matchSorter(locations, searchQuery, {
          keys: ["intId"],
          baseSort: customOrderSorter(order),
        });
      default:
        return locations;
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
        />
      </Space>

      <Divider />

      <div css={{ overflow: "auto", flex: 1 }}>
        <Space wrap size="large">
          {getOrderedLocations?.map((loc) => (
            <LocationsPickerOption
              key={loc.id}
              location={loc}
              selected={selectedLocations.indexOf(loc) > -1}
              onSelectChange={handleLocSelection}
            />
          ))}
        </Space>
      </div>
    </Layout.Content>
  );
}

const LocationsPickerOption = ({
  location,
  selected,
  onSelectChange,
}: {
  location: Location;
  selected: boolean;
  onSelectChange: (location: Location) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Card
      css={{ width: 270 }}
      title={location.name}
      extra={[
        <Checkbox
          key="check"
          checked={selected}
          onChange={(e) => onSelectChange(location)}
        />,
      ]}
    >
      <Card.Meta
        description={
          <Typography.Text>
            {t("City: {{0}}", { 0: location.address?.city })}
            <br />
            {t("ID: {{0}}", { 0: location.intId })}
          </Typography.Text>
        }
      />
    </Card>
  );
};

export default LocationsPicker;
