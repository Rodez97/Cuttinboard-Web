/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Input, Layout, Table } from "antd";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { useOwner } from "../OwnerPortal";
import { differenceBy } from "lodash";
import { ILocation } from "@cuttinboard-solutions/types-helpers";

export default ({
  selectedLocations,
  onSelectionChange,
  alreadySelected,
}: {
  selectedLocations: ILocation[];
  onSelectionChange: (locs: ILocation[]) => void;
  alreadySelected: ILocation[];
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { locations } = useOwner();

  const getLocations = useMemo(() => {
    const availableLocations = differenceBy(locations, alreadySelected, "id");
    return searchQuery
      ? matchSorter(availableLocations, searchQuery, {
          keys: ["name"],
        })
      : availableLocations;
  }, [alreadySelected, locations, searchQuery]);

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
      <Input.Search
        placeholder={t("Search")}
        css={{ width: 250, marginBottom: 10 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        allowClear
      />

      <div css={{ overflow: "auto", flex: 1 }}>
        <Table<ILocation>
          css={{ width: "100%" }}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              filterMode: "menu",
              filterSearch: true,
              onFilter: (value: string, record) =>
                record.name.toLowerCase().includes(value.toLowerCase()),
              sorter: (a, b) => a.name.localeCompare(b.name),
              defaultSortOrder: "ascend",
            },
            {
              title: "State",
              dataIndex: ["address", "state"],
              key: "state",
              sorter: (a, b) => {
                const aState = a.address?.state ?? "";
                const bState = b.address?.state ?? "";
                return aState.localeCompare(bState);
              },
            },
            {
              title: "City",
              dataIndex: ["address", "city"],
              key: "city",
              sorter: (a, b) => {
                const aCity = a.address?.city ?? "";
                const bCity = b.address?.city ?? "";
                return aCity.localeCompare(bCity);
              },
            },
            {
              title: "ID",
              dataIndex: "intId",
              key: "id",
              sorter: (a, b) => {
                const aId = a.intId ?? "";
                const bId = b.intId ?? "";
                return aId.localeCompare(bId);
              },
            },
          ]}
          dataSource={getLocations}
          size="small"
          pagination={false}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedLocations.map((l) => l.id),
            onChange: (_, selected) => {
              onSelectionChange(selected);
            },
            getCheckboxProps: (record: ILocation) => ({
              name: record.name,
              value: record.id,
            }),
          }}
        />
      </div>
    </Layout.Content>
  );
};
