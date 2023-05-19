import { useMemo, useState } from "react";
import { KeyOption, matchSorter } from "match-sorter";
import orderBy from "lodash-es/orderBy";

type InitialState = {
  order: "desc" | "asc";
  index: number;
  searchQuery?: string;
};

// An array of the keys of T
type SorterAttributes<T> = Array<{ attr: keyof T; label: string }>;

type SorterProps<T> = {
  attributes: SorterAttributes<T>;
  items: T[];
  queryAttr: KeyOption<T>[];
  initialState?: InitialState;
};

export default function useSorter<T>({
  attributes,
  items,
  queryAttr,
  initialState,
}: SorterProps<T>) {
  const [order, setOrder] = useState<"desc" | "asc">(
    initialState?.order || "desc"
  );
  const [index, setIndex] = useState<number>(initialState?.index || 0);
  const [searchQuery, setSearchQuery] = useState<string>(
    initialState?.searchQuery || ""
  );

  const changeOrder = (order: "desc" | "asc") => {
    setOrder(order);
  };

  const changeIndex = (index: number) => {
    setIndex(index);
  };

  const changeSearchQuery = (searchQuery: string) => {
    setSearchQuery(searchQuery);
  };

  const getOrderedItems = useMemo(() => {
    if (!items) {
      return [];
    }

    const filtered = searchQuery
      ? matchSorter(items, searchQuery, {
          keys: [...queryAttr],
        })
      : items;

    const filterAttr = attributes[index].attr;

    return orderBy(filtered, filterAttr, order);
  }, [items, index, order, searchQuery, queryAttr, attributes]);

  return {
    getOrderedItems,
    changeOrder,
    changeIndex,
    changeSearchQuery,
    order,
    index,
    searchQuery,
    attributes,
  };
}
