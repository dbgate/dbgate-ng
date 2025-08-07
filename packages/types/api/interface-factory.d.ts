// Generic TypeScript template for generating interfaces from API request union types

/**
 * Extract the action name from a request type
 */
type ExtractAction<T> = T extends { action: infer A } ? A : never;

/**
 * Extract the params type from a request type
 */
type ExtractParams<T> = T extends { params: infer P } ? P : never;

/**
 * Extract the response type from a request type
 */
type ExtractResponse<T> = T extends { response: infer R } ? R : never;

/**
 * Convert action name to method name (camelCase)
 * Examples: "list" -> "list", "newSqliteDatabase" -> "newSqliteDatabase"
 */
type ActionToMethodName<T extends string> = T extends string ? T : never;

/**
 * Generate a method signature from a request type
 */
type GenerateMethodSignature<T> = T extends { action: infer A; params: infer P; response: infer R }
  ? A extends string
    ? {
        [K in ActionToMethodName<A>]: (params: P) => Promise<R>;
      }
    : never
  : never;

/**
 * Union all method signatures from a union of request types
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Main factory type that generates an interface from API request union types
 */
export type ApiInterfaceFactory<T> = UnionToIntersection<GenerateMethodSignature<T>>;

/**
 * Alternative factory that includes optional context parameter for all methods
 */
export type ApiInterfaceFactoryWithContext<T, TContext = any> = {
  [K in ExtractAction<T> as ActionToMethodName<K>]: (
    params: ExtractParams<Extract<T, { action: K }>>,
    context?: TContext
  ) => Promise<ExtractResponse<Extract<T, { action: K }>>>;
};

/**
 * Factory for async methods without context
 */
export type AsyncApiInterfaceFactory<T> = {
  [K in ExtractAction<T> as ActionToMethodName<K>]: (
    params: ExtractParams<Extract<T, { action: K }>>
  ) => Promise<ExtractResponse<Extract<T, { action: K }>>>;
};

/**
 * Factory for sync methods
 */
export type SyncApiInterfaceFactory<T> = {
  [K in ExtractAction<T> as ActionToMethodName<K>]: (
    params: ExtractParams<Extract<T, { action: K }>>
  ) => ExtractResponse<Extract<T, { action: K }>>;
};

/**
 * Factory with custom method signature
 */
export type CustomApiInterfaceFactory<T, TMethodSignature> = {
  [K in ExtractAction<T> as ActionToMethodName<K>]: TMethodSignature;
};

// Helper types for common use cases
export type RequestParams<T, A extends string> = ExtractParams<Extract<T, { action: A }>>;
export type RequestResponse<T, A extends string> = ExtractResponse<Extract<T, { action: A }>>;

// Example usage types (for documentation)
export type ExampleConnectionManagerInterface = AsyncApiInterfaceFactory<import('./connections-api').Connections_Request>;

/**
 * Utility type to check if all actions are implemented
 */
export type EnsureAllActionsImplemented<T, TImpl> = {
  [K in ExtractAction<T>]: K extends keyof TImpl ? TImpl[K] : `Missing implementation for action: ${K}`;
};
