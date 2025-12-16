import { PAGINATION } from "@/config/constants";
import { useEffect, useState } from "react";

type IEntitySearchProps<
  T extends {
    search: string;
    page: number;
  }
> = {
  setParams: (params: T) => void;
  params: T;
  debounceMs?: number;
};

const useEntitySearch = <
  T extends {
    search: string;
    page: number;
  }
>({
  params,
  setParams,
  debounceMs = 500,
}: IEntitySearchProps<T>) => {
  const [localSearch, setLocalSearch] = useState<string | null>(
    params.search.trim()
  );

  useEffect(() => {
    if (localSearch == "" && params.search != "") {
      setParams({
        ...params,
        search: null,
        page: PAGINATION.DEFAULT_PAGE,
      });
      return;
    }
    const timer = setTimeout(() => {
      if (localSearch != params.search) {
        setParams({
          ...params,
          search: localSearch,
          page: PAGINATION.DEFAULT_PAGE,
        });
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [localSearch, params.search, debounceMs]);

  useEffect(() => {
    const value = params.search.trim() != "" ? params.search : null;
    setLocalSearch(value);
  }, [params.search]);

  return { searchValue: localSearch, onSearchChange: setLocalSearch };
};

export default useEntitySearch;
