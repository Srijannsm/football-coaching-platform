import { useMemo, useState } from "react";

export function useAdminTable({
  initialPage = 1,
  initialPageSize = 10,
  initialSearch = "",
  initialFilters = {},
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  }

  const queryState = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search,
      ...filters,
    }),
    [page, pageSize, search, filters]
  );

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    filters,
    updateFilter,
    queryState,
  };
}