type ExtractHookParams<T> = T extends (...args: infer P) => any ? P : never

export type hooksOptionsTypes<Client extends Record<string, any>> = {
  /** GET (single item) */
  GetQueryOptions: ExtractHookParams<Client['useGet']>[0]
  GetSuspenseQueryOptions: ExtractHookParams<Client['useSuspenseGet']>[0]

  /** GET MANY */
  GetManyQueryOptions: ExtractHookParams<Client['useGetQuries']>[0]
  GetManySuspenseQueryOptions: ExtractHookParams<
    Client['useSuspenseGetQuries']
  >[0]

  /** LIST (paginated) */
  ListQueryOptions: ExtractHookParams<Client['useList']>[0]
  ListSuspenseQueryOptions: ExtractHookParams<Client['useSuspenseList']>[0]

  /** INFINITE LIST */
  InfiniteListQueryOptions: ExtractHookParams<Client['useCursorList']>[0]
  InfiniteListSuspenseQueryOptions: ExtractHookParams<
    Client['useSuspenseCursorList']
  >[0]

  /** POST */
  PostOptions: ExtractHookParams<Client['usePost']>[0]

  /** MUTATIONS */
  CreateMutationOptions: ExtractHookParams<Client['useCreate']>[0]
  UpdateMutationOptions: ExtractHookParams<Client['useUpdate']>[0]
  DeleteMutationOptions: ExtractHookParams<Client['useDelete']>[0]
}

// type ExtractParams<T> = T extends (...args: infer P) => any ? P : never;

// // Helper to attach a generic type to the extracted params
// type WithEntity<Params extends any[], Entity> = Params & { entity?: Entity };

// // Add optional data & vars
// type WithVars<P extends any[], Data, Vars> = P & {
//   data?: Data;
//   vars?: Vars;
// };

// export type CreateCrudHookTypes<Client extends Record<string, any>> = {
//   Get: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useGet"]>,
//     Entity
//   >;

//   GetSuspense: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useSuspenseGet"]>,
//     Entity
//   >;

//   GetMany: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useGetQueries"]>,
//     Entity
//   >;

//   GetManySuspense: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useSuspenseGetQueries"]>,
//     Entity
//   >;

//   List: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useList"]>,
//     Entity
//   >;

//   ListSuspense: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useSuspenseList"]>,
//     Entity
//   >;

//   ListInfinite: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useListInfinite"]>,
//     Entity
//   >;

//   ListInfiniteSuspense: <Entity = never>() => WithEntity<
//     ExtractParams<Client["useSuspenseListInfinite"]>,
//     Entity
//   >;

//   Create: <Data = any, Vars = any>() => WithVars<
//     ExtractParams<Client["useCreate"]>,
//     Data,
//     Vars
//   >;

//   Update: <Data = any, Vars = any>() => WithVars<
//     ExtractParams<Client["useUpdate"]>,
//     Data,
//     Vars
//   >;

//   Delete: <Data = any>() => ExtractParams<Client["useDelete"]> & {
//     data?: Data;
//   };
// };
