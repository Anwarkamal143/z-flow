"use client";

import { getValidNumber } from "@/lib";
import { Dispatch, SetStateAction, useState } from "react";

export const useListHook = <
  Client extends Record<string, any>,
  Options extends Client["listOptions"]
>(
  client: Client,
  props?: Options
): ReturnType<Client["useList"]> & {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  fetchNextPage: (page?: number | string) => number | null;
  fetchPreviousPage: (page?: number | string) => number | null;
  fetchCurrentPage: (page?: number | string) => number | null;
} => {
  const initialPage = getValidNumber(props?.params?.page) ?? 1;
  const [page, setPage] = useState(initialPage);

  const data = client.useList({
    ...(props || {}),
    params: { ...(props?.params || {}), page },
  });

  const pagination = data?.data?.pagination_meta;

  // ---- NEXT PAGE ----
  function fetchNextPage(p = page) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setPage(next);
    return next;
  }

  // ---- CURRENT PAGE ----
  function fetchCurrentPage(p?: number | string) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setPage(current);
    return current;
  }

  // ---- PREVIOUS PAGE ----
  function fetchPreviousPage(p = page) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setPage(prev);
    return prev;
  }

  return {
    ...data,
    page,
    setPage,
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
  setPage: Dispatch<SetStateAction<number>>;
  fetchNextPage: (page?: number | string) => number | null;
  fetchPreviousPage: (page?: number | string) => number | null;
  fetchCurrentPage: (page?: number | string) => number | null;
} => {
  const initialPage = getValidNumber(props?.params?.page) ?? 1;
  const [page, setPage] = useState(initialPage);

  const data = client.useSuspenseList({
    ...(props || {}),
    params: { ...(props?.params || {}), page },
  });

  const pagination = data?.data?.pagination_meta;

  // ---- NEXT PAGE ----
  function fetchNextPage(p = page) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current >= pagination.totalPages) return null;

    const next = current + 1;
    setPage(next);
    return next;
  }

  // ---- CURRENT PAGE ----
  function fetchCurrentPage(p?: number | string) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current < 1 || current > pagination.totalPages) return null;

    setPage(current);
    return current;
  }

  // ---- PREVIOUS PAGE ----
  function fetchPreviousPage(p = page) {
    const current = getValidNumber(p);
    if (current == null) return null;

    if (current <= 1) return null;

    const prev = current - 1;
    setPage(prev);
    return prev;
  }

  return {
    ...data,
    page,
    setPage,
    fetchNextPage,
    fetchPreviousPage,
    fetchCurrentPage,
  };
};
