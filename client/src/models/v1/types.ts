/* =============================
   CRUD Hook Parameter Types Extraction
   ============================= */

type ExtractHookParams<T> = T extends (...args: infer P) => any ? P : never;

// Extract the first parameter type from a hook function
type ExtractHookOptions<T> = T extends (...args: any) => any
  ? ExtractHookParams<T>[0]
  : never;

// Extract the second parameter type (for suspense variants)
type ExtractHookSuspenseParam<T> = T extends (...args: any) => any
  ? ExtractHookParams<T>[1]
  : never;

export type CrudHookOptionsTypes<Client extends Record<string, any>> = {
  /** GET (single item) */
  GetQueryOptions: ExtractHookOptions<Client["useGet"]>;
  GetSuspenseQueryOptions: ExtractHookOptions<Client["useSuspenseGet"]>;

  /** GET MANY */
  GetManyQueryOptions: ExtractHookOptions<Client["useGetMany"]>;
  GetManySuspenseQueryOptions: ExtractHookOptions<Client["useSuspenseGetMany"]>;

  /** LIST (offset paginated) */
  ListQueryOptions: ExtractHookOptions<Client["useList"]>;
  ListSuspenseQueryOptions: ExtractHookOptions<Client["useSuspenseList"]>;

  /** INFINITE LIST (cursor paginated) */
  InfiniteListQueryOptions: ExtractHookOptions<Client["useInfiniteList"]>;
  InfiniteListSuspenseQueryOptions: ExtractHookOptions<
    Client["useSuspenseInfiniteList"]
  >;

  /** MUTATIONS */
  CreateMutationOptions: ExtractHookOptions<Client["useCreate"]>;
  UpdateMutationOptions: ExtractHookOptions<Client["useUpdate"]>;
  DeleteMutationOptions: ExtractHookOptions<Client["useDelete"]>;
};

// Single operation extractors
export type GetOptions<Client extends Record<string, any>> = ExtractHookOptions<
  Client["useGet"]
>;
export type GetSuspenseOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useSuspenseGet"]>;

export type GetManyOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useGetMany"]>;
export type GetManySuspenseOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useSuspenseGetMany"]>;

export type ListOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useList"]>;
export type ListSuspenseOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useSuspenseList"]>;

export type InfiniteListOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useInfiniteList"]>;
export type InfiniteListSuspenseOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useSuspenseInfiniteList"]>;

export type CreateOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useCreate"]>;
export type UpdateOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useUpdate"]>;
export type DeleteOptions<Client extends Record<string, any>> =
  ExtractHookOptions<Client["useDelete"]>;

export type CrudRawMethodTypes<Client extends Record<string, any>> = {
  /** RAW API METHODS */
  ListRawOptions: ExtractHookOptions<Client["listRaw"]>;
  GetRawOptions: ExtractHookOptions<Client["getRaw"]>;
  CreateRawOptions: ExtractHookOptions<Client["createRaw"]>;
  UpdateRawOptions: ExtractHookOptions<Client["updateRaw"]>;
  DeleteRawOptions: ExtractHookOptions<Client["deleteRaw"]>;
};

export type CrudUtilityTypes<Client extends Record<string, any>> = {
  /** UTILITIES */
  PrefetchListOptions: ExtractHookOptions<Client["prefetchList"]>;
  PrefetchGetOptions: ExtractHookOptions<Client["prefetchGet"]>;
  UpdateCacheOptions: ExtractHookOptions<Client["updateCache"]>;
};

/* -----------------------
   Enhanced Type Extraction with Generics
   ----------------------- */

// Helper to attach entity type to the extracted params
type WithEntity<Params extends any, Entity> = Params & { entity?: Entity };

// Helper for mutation parameters with data and variables
type WithMutationVars<P extends any, Data, Vars> = P & {
  data?: Data;
  vars?: Vars;
};

// Helper for list parameters with item type
type WithListItems<P extends any, Items> = P & {
  items?: Items[];
};

export type CreateCrudHookTypes<Client extends Record<string, any>> = {
  /** SINGLE ENTITY QUERIES */
  Get: <Entity = never>() => WithEntity<
    ExtractHookOptions<Client["useGet"]>,
    Entity
  >;

  GetSuspense: <Entity = never>() => WithEntity<
    ExtractHookOptions<Client["useSuspenseGet"]>,
    Entity
  >;

  /** MULTIPLE ENTITIES QUERIES */
  GetMany: <Entity = never>() => WithEntity<
    ExtractHookOptions<Client["useGetMany"]>,
    Entity
  >;

  GetManySuspense: <Entity = never>() => WithEntity<
    ExtractHookOptions<Client["useSuspenseGetMany"]>,
    Entity
  >;

  /** PAGINATED LISTS */
  List: <Entity = never>() => WithListItems<
    WithEntity<ExtractHookOptions<Client["useList"]>, Entity>,
    Entity
  >;

  ListSuspense: <Entity = never>() => WithListItems<
    WithEntity<ExtractHookOptions<Client["useSuspenseList"]>, Entity>,
    Entity
  >;

  /** INFINITE LISTS */
  InfiniteList: <Entity = never>() => WithListItems<
    WithEntity<ExtractHookOptions<Client["useInfiniteList"]>, Entity>,
    Entity
  >;

  InfiniteListSuspense: <Entity = never>() => WithListItems<
    WithEntity<ExtractHookOptions<Client["useSuspenseInfiniteList"]>, Entity>,
    Entity
  >;

  /** MUTATIONS */
  Create: <Data = any, Vars = any>() => WithMutationVars<
    ExtractHookOptions<Client["useCreate"]>,
    Data,
    Vars
  >;

  Update: <Data = any, Vars = any>() => WithMutationVars<
    ExtractHookOptions<Client["useUpdate"]>,
    Data,
    Vars
  >;

  Delete: <Data = any>() => ExtractHookOptions<Client["useDelete"]> & {
    data?: Data;
  };
};

/* -----------------------
   Raw Method Type Extraction
   ----------------------- */

export type CreateCrudRawTypes<Client extends Record<string, any>> = {
  ListRaw: <Entity = never>() => WithListItems<
    WithEntity<ExtractHookOptions<Client["listRaw"]>, Entity>,
    Entity
  >;

  GetRaw: <Entity = never>() => WithEntity<
    ExtractHookOptions<Client["getRaw"]>,
    Entity
  >;

  CreateRaw: <Data = any, Vars = any>() => WithMutationVars<
    ExtractHookOptions<Client["createRaw"]>,
    Data,
    Vars
  >;

  UpdateRaw: <Data = any, Vars = any>() => WithMutationVars<
    ExtractHookOptions<Client["updateRaw"]>,
    Data,
    Vars
  >;

  DeleteRaw: <Data = any>() => ExtractHookOptions<Client["deleteRaw"]> & {
    data?: Data;
  };
};

/* -----------------------
   Complete CRUD Types Bundle
   ----------------------- */

export type CrudClientTypes<Client extends Record<string, any>> = {
  // Hook options (exact parameter types)
  Options: CrudHookOptionsTypes<Client>;

  // Raw method options
  RawOptions: CrudRawMethodTypes<Client>;

  // Utility options
  UtilityOptions: CrudUtilityTypes<Client>;

  // Enhanced types with generics
  Hooks: CreateCrudHookTypes<Client>;
  Raw: CreateCrudRawTypes<Client>;
};
