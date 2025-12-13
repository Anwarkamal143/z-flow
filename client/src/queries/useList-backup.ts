"use client";

import { getValidNumber } from "@/lib";
import { IPaginationMeta } from "@/types/Iquery";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useListHook = <
  Client extends Record<string, any>,
  Options extends Client["listOptions"]
>(
  client: Client,
  props?: Options
): ReturnType<Client["useList"]> & {
  page: number;
  params: Client["listParamsOptions"];
  setParams: Dispatch<SetStateAction<Client["listParamsOptions"]>>;
  fetchNextPage: (page?: number | string) => number | null;
  fetchPreviousPage: (page?: number | string) => number | null;
  fetchCurrentPage: (page?: number | string) => number | null;
} => {
  const initialPage = getValidNumber(props?.params?.page) ?? 1;
  const [params, setParams] = useState({
    ...(props?.params || {}),
    page: initialPage,
  });

  const data = client.useList({
    ...(props || {}),
    params,
  });
  useEffect(() => {
    setParams(props?.params);

    return () => {};
  }, [props?.params]);
  const pagination = data?.data?.pagination_meta;

  // ---- NEXT PAGE ----
  function fetchNextPage(p = (params.page = 1)) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setParams({ ...params, page: next });
    return next;
  }

  // ---- CURRENT PAGE ----
  function fetchCurrentPage(p?: number | string) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setParams({ ...params, page: current });
    return current;
  }

  // ---- PREVIOUS PAGE ----
  function fetchPreviousPage(p = (params.page = 1)) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setParams({ ...params, page: prev });
    return prev;
  }

  return {
    ...data,
    page: params.page,
    params,
    setParams,
    fetchNextPage,
    fetchPreviousPage,
    fetchCurrentPage,
  };
};
export const useSuspenseListHook = <
  Client extends Record<string, any>,
  Options extends Client["listOptions"]
>(
  client: Client,
  props?: Options
): ReturnType<Client["useSuspenseList"]> & {
  page: number;
  params: Client["listParamsOptions"];
  setParams: Dispatch<SetStateAction<Client["listParamsOptions"]>>;
  fetchNextPage: (page?: number | string) => number | null;
  fetchPreviousPage: (page?: number | string) => number | null;
  fetchCurrentPage: (page?: number | string) => number | null;
  pagination_meta: IPaginationMeta;
} => {
  const initialPage = getValidNumber(props?.params?.page) ?? 1;
  const [params, setParams] = useState({
    ...(props?.params || {}),
    page: initialPage,
  });

  const data = client.useSuspenseList({
    ...(props || {}),
    params,
  });
  useEffect(() => {
    setParams(props?.params);

    return () => {};
  }, [props?.params]);

  const pagination = data?.data?.pagination_meta;

  // ---- NEXT PAGE ----
  function fetchNextPage(p = params.page || 1) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setParams((p: any) => ({ ...p, page: next }));
    return next;
  }

  // ---- CURRENT PAGE ----
  function fetchCurrentPage(p?: number | string) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setParams((p: any) => ({ ...p, page: current }));
    return current;
  }

  // ---- PREVIOUS PAGE ----
  function fetchPreviousPage(p = params.page || 1) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setParams((p: any) => ({ ...p, page: prev }));

    return prev;
  }

  return {
    ...data,
    params,
    page: params.page,
    setParams,
    fetchNextPage,
    fetchPreviousPage,
    fetchCurrentPage,
    pagination_meta: pagination,
  };
};
