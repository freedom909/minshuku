
/**
 * Client
**/

import * as runtime from './runtime/library';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Amenity
 * 
 */
export type Amenity = $Result.DefaultSelection<Prisma.$AmenityPayload>
/**
 * Model Listing
 * 
 */
export type Listing = $Result.DefaultSelection<Prisma.$ListingPayload>
/**
 * Model ListingAmenities
 * 
 */
export type ListingAmenities = $Result.DefaultSelection<Prisma.$ListingAmenitiesPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Amenities
 * const amenities = await prisma.amenity.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Amenities
   * const amenities = await prisma.amenity.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<'extends', Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.amenity`: Exposes CRUD operations for the **Amenity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Amenities
    * const amenities = await prisma.amenity.findMany()
    * ```
    */
  get amenity(): Prisma.AmenityDelegate<ExtArgs>;

  /**
   * `prisma.listing`: Exposes CRUD operations for the **Listing** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Listings
    * const listings = await prisma.listing.findMany()
    * ```
    */
  get listing(): Prisma.ListingDelegate<ExtArgs>;

  /**
   * `prisma.listingAmenities`: Exposes CRUD operations for the **ListingAmenities** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ListingAmenities
    * const listingAmenities = await prisma.listingAmenities.findMany()
    * ```
    */
  get listingAmenities(): Prisma.ListingAmenitiesDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.4.2
   * Query Engine version: ac9d7041ed77bcc8a8dbd2ab6616b39013829574
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | { toJSON(): unknown }

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Amenity: 'Amenity',
    Listing: 'Listing',
    ListingAmenities: 'ListingAmenities'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }


  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs}, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    meta: {
      modelProps: 'amenity' | 'listing' | 'listingAmenities'
      txIsolationLevel: Prisma.TransactionIsolationLevel
    },
    model: {
      Amenity: {
        payload: Prisma.$AmenityPayload<ExtArgs>
        fields: Prisma.AmenityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AmenityFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AmenityFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          findFirst: {
            args: Prisma.AmenityFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AmenityFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          findMany: {
            args: Prisma.AmenityFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>[]
          }
          create: {
            args: Prisma.AmenityCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          createMany: {
            args: Prisma.AmenityCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.AmenityDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          update: {
            args: Prisma.AmenityUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          deleteMany: {
            args: Prisma.AmenityDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.AmenityUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.AmenityUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$AmenityPayload>
          }
          aggregate: {
            args: Prisma.AmenityAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateAmenity>
          }
          groupBy: {
            args: Prisma.AmenityGroupByArgs<ExtArgs>,
            result: $Utils.Optional<AmenityGroupByOutputType>[]
          }
          count: {
            args: Prisma.AmenityCountArgs<ExtArgs>,
            result: $Utils.Optional<AmenityCountAggregateOutputType> | number
          }
        }
      }
      Listing: {
        payload: Prisma.$ListingPayload<ExtArgs>
        fields: Prisma.ListingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ListingFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ListingFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          findFirst: {
            args: Prisma.ListingFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ListingFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          findMany: {
            args: Prisma.ListingFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>[]
          }
          create: {
            args: Prisma.ListingCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          createMany: {
            args: Prisma.ListingCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.ListingDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          update: {
            args: Prisma.ListingUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          deleteMany: {
            args: Prisma.ListingDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.ListingUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.ListingUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingPayload>
          }
          aggregate: {
            args: Prisma.ListingAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateListing>
          }
          groupBy: {
            args: Prisma.ListingGroupByArgs<ExtArgs>,
            result: $Utils.Optional<ListingGroupByOutputType>[]
          }
          count: {
            args: Prisma.ListingCountArgs<ExtArgs>,
            result: $Utils.Optional<ListingCountAggregateOutputType> | number
          }
        }
      }
      ListingAmenities: {
        payload: Prisma.$ListingAmenitiesPayload<ExtArgs>
        fields: Prisma.ListingAmenitiesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ListingAmenitiesFindUniqueArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ListingAmenitiesFindUniqueOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          findFirst: {
            args: Prisma.ListingAmenitiesFindFirstArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ListingAmenitiesFindFirstOrThrowArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          findMany: {
            args: Prisma.ListingAmenitiesFindManyArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>[]
          }
          create: {
            args: Prisma.ListingAmenitiesCreateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          createMany: {
            args: Prisma.ListingAmenitiesCreateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          delete: {
            args: Prisma.ListingAmenitiesDeleteArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          update: {
            args: Prisma.ListingAmenitiesUpdateArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          deleteMany: {
            args: Prisma.ListingAmenitiesDeleteManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          updateMany: {
            args: Prisma.ListingAmenitiesUpdateManyArgs<ExtArgs>,
            result: Prisma.BatchPayload
          }
          upsert: {
            args: Prisma.ListingAmenitiesUpsertArgs<ExtArgs>,
            result: $Utils.PayloadToResult<Prisma.$ListingAmenitiesPayload>
          }
          aggregate: {
            args: Prisma.ListingAmenitiesAggregateArgs<ExtArgs>,
            result: $Utils.Optional<AggregateListingAmenities>
          }
          groupBy: {
            args: Prisma.ListingAmenitiesGroupByArgs<ExtArgs>,
            result: $Utils.Optional<ListingAmenitiesGroupByOutputType>[]
          }
          count: {
            args: Prisma.ListingAmenitiesCountArgs<ExtArgs>,
            result: $Utils.Optional<ListingAmenitiesCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<'define', Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AmenityCountOutputType
   */

  export type AmenityCountOutputType = {
    listing: number
  }

  export type AmenityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    listing?: boolean | AmenityCountOutputTypeCountListingArgs
  }

  // Custom InputTypes

  /**
   * AmenityCountOutputType without action
   */
  export type AmenityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AmenityCountOutputType
     */
    select?: AmenityCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * AmenityCountOutputType without action
   */
  export type AmenityCountOutputTypeCountListingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ListingAmenitiesWhereInput
  }



  /**
   * Count Type ListingCountOutputType
   */

  export type ListingCountOutputType = {
    amenities: number
  }

  export type ListingCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    amenities?: boolean | ListingCountOutputTypeCountAmenitiesArgs
  }

  // Custom InputTypes

  /**
   * ListingCountOutputType without action
   */
  export type ListingCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingCountOutputType
     */
    select?: ListingCountOutputTypeSelect<ExtArgs> | null
  }


  /**
   * ListingCountOutputType without action
   */
  export type ListingCountOutputTypeCountAmenitiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ListingAmenitiesWhereInput
  }



  /**
   * Models
   */

  /**
   * Model Amenity
   */

  export type AggregateAmenity = {
    _count: AmenityCountAggregateOutputType | null
    _min: AmenityMinAggregateOutputType | null
    _max: AmenityMaxAggregateOutputType | null
  }

  export type AmenityMinAggregateOutputType = {
    id: string | null
    category: string | null
    name: string | null
  }

  export type AmenityMaxAggregateOutputType = {
    id: string | null
    category: string | null
    name: string | null
  }

  export type AmenityCountAggregateOutputType = {
    id: number
    category: number
    name: number
    _all: number
  }


  export type AmenityMinAggregateInputType = {
    id?: true
    category?: true
    name?: true
  }

  export type AmenityMaxAggregateInputType = {
    id?: true
    category?: true
    name?: true
  }

  export type AmenityCountAggregateInputType = {
    id?: true
    category?: true
    name?: true
    _all?: true
  }

  export type AmenityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Amenity to aggregate.
     */
    where?: AmenityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Amenities to fetch.
     */
    orderBy?: AmenityOrderByWithRelationInput | AmenityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AmenityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Amenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Amenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Amenities
    **/
    _count?: true | AmenityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AmenityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AmenityMaxAggregateInputType
  }

  export type GetAmenityAggregateType<T extends AmenityAggregateArgs> = {
        [P in keyof T & keyof AggregateAmenity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAmenity[P]>
      : GetScalarType<T[P], AggregateAmenity[P]>
  }




  export type AmenityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AmenityWhereInput
    orderBy?: AmenityOrderByWithAggregationInput | AmenityOrderByWithAggregationInput[]
    by: AmenityScalarFieldEnum[] | AmenityScalarFieldEnum
    having?: AmenityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AmenityCountAggregateInputType | true
    _min?: AmenityMinAggregateInputType
    _max?: AmenityMaxAggregateInputType
  }

  export type AmenityGroupByOutputType = {
    id: string
    category: string
    name: string
    _count: AmenityCountAggregateOutputType | null
    _min: AmenityMinAggregateOutputType | null
    _max: AmenityMaxAggregateOutputType | null
  }

  type GetAmenityGroupByPayload<T extends AmenityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AmenityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AmenityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AmenityGroupByOutputType[P]>
            : GetScalarType<T[P], AmenityGroupByOutputType[P]>
        }
      >
    >


  export type AmenitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    category?: boolean
    name?: boolean
    listing?: boolean | Amenity$listingArgs<ExtArgs>
    _count?: boolean | AmenityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["amenity"]>

  export type AmenitySelectScalar = {
    id?: boolean
    category?: boolean
    name?: boolean
  }

  export type AmenityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    listing?: boolean | Amenity$listingArgs<ExtArgs>
    _count?: boolean | AmenityCountOutputTypeDefaultArgs<ExtArgs>
  }


  export type $AmenityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Amenity"
    objects: {
      listing: Prisma.$ListingAmenitiesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      category: string
      name: string
    }, ExtArgs["result"]["amenity"]>
    composites: {}
  }


  type AmenityGetPayload<S extends boolean | null | undefined | AmenityDefaultArgs> = $Result.GetResult<Prisma.$AmenityPayload, S>

  type AmenityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AmenityFindManyArgs, 'select' | 'include'> & {
      select?: AmenityCountAggregateInputType | true
    }

  export interface AmenityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Amenity'], meta: { name: 'Amenity' } }
    /**
     * Find zero or one Amenity that matches the filter.
     * @param {AmenityFindUniqueArgs} args - Arguments to find a Amenity
     * @example
     * // Get one Amenity
     * const amenity = await prisma.amenity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AmenityFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityFindUniqueArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Amenity that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AmenityFindUniqueOrThrowArgs} args - Arguments to find a Amenity
     * @example
     * // Get one Amenity
     * const amenity = await prisma.amenity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AmenityFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Amenity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityFindFirstArgs} args - Arguments to find a Amenity
     * @example
     * // Get one Amenity
     * const amenity = await prisma.amenity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AmenityFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityFindFirstArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Amenity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityFindFirstOrThrowArgs} args - Arguments to find a Amenity
     * @example
     * // Get one Amenity
     * const amenity = await prisma.amenity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AmenityFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Amenities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Amenities
     * const amenities = await prisma.amenity.findMany()
     * 
     * // Get first 10 Amenities
     * const amenities = await prisma.amenity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const amenityWithIdOnly = await prisma.amenity.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AmenityFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Amenity.
     * @param {AmenityCreateArgs} args - Arguments to create a Amenity.
     * @example
     * // Create one Amenity
     * const Amenity = await prisma.amenity.create({
     *   data: {
     *     // ... data to create a Amenity
     *   }
     * })
     * 
    **/
    create<T extends AmenityCreateArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityCreateArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Amenities.
     *     @param {AmenityCreateManyArgs} args - Arguments to create many Amenities.
     *     @example
     *     // Create many Amenities
     *     const amenity = await prisma.amenity.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends AmenityCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Amenity.
     * @param {AmenityDeleteArgs} args - Arguments to delete one Amenity.
     * @example
     * // Delete one Amenity
     * const Amenity = await prisma.amenity.delete({
     *   where: {
     *     // ... filter to delete one Amenity
     *   }
     * })
     * 
    **/
    delete<T extends AmenityDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityDeleteArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Amenity.
     * @param {AmenityUpdateArgs} args - Arguments to update one Amenity.
     * @example
     * // Update one Amenity
     * const amenity = await prisma.amenity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AmenityUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityUpdateArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Amenities.
     * @param {AmenityDeleteManyArgs} args - Arguments to filter Amenities to delete.
     * @example
     * // Delete a few Amenities
     * const { count } = await prisma.amenity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AmenityDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, AmenityDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Amenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Amenities
     * const amenity = await prisma.amenity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AmenityUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Amenity.
     * @param {AmenityUpsertArgs} args - Arguments to update or create a Amenity.
     * @example
     * // Update or create a Amenity
     * const amenity = await prisma.amenity.upsert({
     *   create: {
     *     // ... data to create a Amenity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Amenity we want to update
     *   }
     * })
    **/
    upsert<T extends AmenityUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, AmenityUpsertArgs<ExtArgs>>
    ): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Amenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityCountArgs} args - Arguments to filter Amenities to count.
     * @example
     * // Count the number of Amenities
     * const count = await prisma.amenity.count({
     *   where: {
     *     // ... the filter for the Amenities we want to count
     *   }
     * })
    **/
    count<T extends AmenityCountArgs>(
      args?: Subset<T, AmenityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AmenityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Amenity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AmenityAggregateArgs>(args: Subset<T, AmenityAggregateArgs>): Prisma.PrismaPromise<GetAmenityAggregateType<T>>

    /**
     * Group by Amenity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AmenityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AmenityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AmenityGroupByArgs['orderBy'] }
        : { orderBy?: AmenityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AmenityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAmenityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Amenity model
   */
  readonly fields: AmenityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Amenity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AmenityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    listing<T extends Amenity$listingArgs<ExtArgs> = {}>(args?: Subset<T, Amenity$listingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findMany'> | Null>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Amenity model
   */ 
  interface AmenityFieldRefs {
    readonly id: FieldRef<"Amenity", 'String'>
    readonly category: FieldRef<"Amenity", 'String'>
    readonly name: FieldRef<"Amenity", 'String'>
  }
    

  // Custom InputTypes

  /**
   * Amenity findUnique
   */
  export type AmenityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter, which Amenity to fetch.
     */
    where: AmenityWhereUniqueInput
  }


  /**
   * Amenity findUniqueOrThrow
   */
  export type AmenityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter, which Amenity to fetch.
     */
    where: AmenityWhereUniqueInput
  }


  /**
   * Amenity findFirst
   */
  export type AmenityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter, which Amenity to fetch.
     */
    where?: AmenityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Amenities to fetch.
     */
    orderBy?: AmenityOrderByWithRelationInput | AmenityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Amenities.
     */
    cursor?: AmenityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Amenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Amenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Amenities.
     */
    distinct?: AmenityScalarFieldEnum | AmenityScalarFieldEnum[]
  }


  /**
   * Amenity findFirstOrThrow
   */
  export type AmenityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter, which Amenity to fetch.
     */
    where?: AmenityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Amenities to fetch.
     */
    orderBy?: AmenityOrderByWithRelationInput | AmenityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Amenities.
     */
    cursor?: AmenityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Amenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Amenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Amenities.
     */
    distinct?: AmenityScalarFieldEnum | AmenityScalarFieldEnum[]
  }


  /**
   * Amenity findMany
   */
  export type AmenityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter, which Amenities to fetch.
     */
    where?: AmenityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Amenities to fetch.
     */
    orderBy?: AmenityOrderByWithRelationInput | AmenityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Amenities.
     */
    cursor?: AmenityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Amenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Amenities.
     */
    skip?: number
    distinct?: AmenityScalarFieldEnum | AmenityScalarFieldEnum[]
  }


  /**
   * Amenity create
   */
  export type AmenityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * The data needed to create a Amenity.
     */
    data: XOR<AmenityCreateInput, AmenityUncheckedCreateInput>
  }


  /**
   * Amenity createMany
   */
  export type AmenityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Amenities.
     */
    data: AmenityCreateManyInput | AmenityCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * Amenity update
   */
  export type AmenityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * The data needed to update a Amenity.
     */
    data: XOR<AmenityUpdateInput, AmenityUncheckedUpdateInput>
    /**
     * Choose, which Amenity to update.
     */
    where: AmenityWhereUniqueInput
  }


  /**
   * Amenity updateMany
   */
  export type AmenityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Amenities.
     */
    data: XOR<AmenityUpdateManyMutationInput, AmenityUncheckedUpdateManyInput>
    /**
     * Filter which Amenities to update
     */
    where?: AmenityWhereInput
  }


  /**
   * Amenity upsert
   */
  export type AmenityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * The filter to search for the Amenity to update in case it exists.
     */
    where: AmenityWhereUniqueInput
    /**
     * In case the Amenity found by the `where` argument doesn't exist, create a new Amenity with this data.
     */
    create: XOR<AmenityCreateInput, AmenityUncheckedCreateInput>
    /**
     * In case the Amenity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AmenityUpdateInput, AmenityUncheckedUpdateInput>
  }


  /**
   * Amenity delete
   */
  export type AmenityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
    /**
     * Filter which Amenity to delete.
     */
    where: AmenityWhereUniqueInput
  }


  /**
   * Amenity deleteMany
   */
  export type AmenityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Amenities to delete
     */
    where?: AmenityWhereInput
  }


  /**
   * Amenity.listing
   */
  export type Amenity$listingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    where?: ListingAmenitiesWhereInput
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    cursor?: ListingAmenitiesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ListingAmenitiesScalarFieldEnum | ListingAmenitiesScalarFieldEnum[]
  }


  /**
   * Amenity without action
   */
  export type AmenityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Amenity
     */
    select?: AmenitySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: AmenityInclude<ExtArgs> | null
  }



  /**
   * Model Listing
   */

  export type AggregateListing = {
    _count: ListingCountAggregateOutputType | null
    _avg: ListingAvgAggregateOutputType | null
    _sum: ListingSumAggregateOutputType | null
    _min: ListingMinAggregateOutputType | null
    _max: ListingMaxAggregateOutputType | null
  }

  export type ListingAvgAggregateOutputType = {
    costPerNight: number | null
    numOfBeds: number | null
  }

  export type ListingSumAggregateOutputType = {
    costPerNight: number | null
    numOfBeds: number | null
  }

  export type ListingMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    costPerNight: number | null
    hostId: string | null
    locationType: string | null
    numOfBeds: number | null
    photoThumbnail: string | null
    isFeatured: boolean | null
  }

  export type ListingMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    costPerNight: number | null
    hostId: string | null
    locationType: string | null
    numOfBeds: number | null
    photoThumbnail: string | null
    isFeatured: boolean | null
  }

  export type ListingCountAggregateOutputType = {
    id: number
    title: number
    description: number
    costPerNight: number
    hostId: number
    locationType: number
    numOfBeds: number
    photoThumbnail: number
    isFeatured: number
    _all: number
  }


  export type ListingAvgAggregateInputType = {
    costPerNight?: true
    numOfBeds?: true
  }

  export type ListingSumAggregateInputType = {
    costPerNight?: true
    numOfBeds?: true
  }

  export type ListingMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    costPerNight?: true
    hostId?: true
    locationType?: true
    numOfBeds?: true
    photoThumbnail?: true
    isFeatured?: true
  }

  export type ListingMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    costPerNight?: true
    hostId?: true
    locationType?: true
    numOfBeds?: true
    photoThumbnail?: true
    isFeatured?: true
  }

  export type ListingCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    costPerNight?: true
    hostId?: true
    locationType?: true
    numOfBeds?: true
    photoThumbnail?: true
    isFeatured?: true
    _all?: true
  }

  export type ListingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Listing to aggregate.
     */
    where?: ListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Listings to fetch.
     */
    orderBy?: ListingOrderByWithRelationInput | ListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Listings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Listings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Listings
    **/
    _count?: true | ListingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ListingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ListingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ListingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ListingMaxAggregateInputType
  }

  export type GetListingAggregateType<T extends ListingAggregateArgs> = {
        [P in keyof T & keyof AggregateListing]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateListing[P]>
      : GetScalarType<T[P], AggregateListing[P]>
  }




  export type ListingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ListingWhereInput
    orderBy?: ListingOrderByWithAggregationInput | ListingOrderByWithAggregationInput[]
    by: ListingScalarFieldEnum[] | ListingScalarFieldEnum
    having?: ListingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ListingCountAggregateInputType | true
    _avg?: ListingAvgAggregateInputType
    _sum?: ListingSumAggregateInputType
    _min?: ListingMinAggregateInputType
    _max?: ListingMaxAggregateInputType
  }

  export type ListingGroupByOutputType = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured: boolean | null
    _count: ListingCountAggregateOutputType | null
    _avg: ListingAvgAggregateOutputType | null
    _sum: ListingSumAggregateOutputType | null
    _min: ListingMinAggregateOutputType | null
    _max: ListingMaxAggregateOutputType | null
  }

  type GetListingGroupByPayload<T extends ListingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ListingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ListingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ListingGroupByOutputType[P]>
            : GetScalarType<T[P], ListingGroupByOutputType[P]>
        }
      >
    >


  export type ListingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    costPerNight?: boolean
    hostId?: boolean
    locationType?: boolean
    numOfBeds?: boolean
    photoThumbnail?: boolean
    isFeatured?: boolean
    amenities?: boolean | Listing$amenitiesArgs<ExtArgs>
    _count?: boolean | ListingCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["listing"]>

  export type ListingSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    costPerNight?: boolean
    hostId?: boolean
    locationType?: boolean
    numOfBeds?: boolean
    photoThumbnail?: boolean
    isFeatured?: boolean
  }

  export type ListingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    amenities?: boolean | Listing$amenitiesArgs<ExtArgs>
    _count?: boolean | ListingCountOutputTypeDefaultArgs<ExtArgs>
  }


  export type $ListingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Listing"
    objects: {
      amenities: Prisma.$ListingAmenitiesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      costPerNight: number
      hostId: string
      locationType: string
      numOfBeds: number
      photoThumbnail: string
      isFeatured: boolean | null
    }, ExtArgs["result"]["listing"]>
    composites: {}
  }


  type ListingGetPayload<S extends boolean | null | undefined | ListingDefaultArgs> = $Result.GetResult<Prisma.$ListingPayload, S>

  type ListingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ListingFindManyArgs, 'select' | 'include'> & {
      select?: ListingCountAggregateInputType | true
    }

  export interface ListingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Listing'], meta: { name: 'Listing' } }
    /**
     * Find zero or one Listing that matches the filter.
     * @param {ListingFindUniqueArgs} args - Arguments to find a Listing
     * @example
     * // Get one Listing
     * const listing = await prisma.listing.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ListingFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, ListingFindUniqueArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one Listing that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ListingFindUniqueOrThrowArgs} args - Arguments to find a Listing
     * @example
     * // Get one Listing
     * const listing = await prisma.listing.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ListingFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first Listing that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingFindFirstArgs} args - Arguments to find a Listing
     * @example
     * // Get one Listing
     * const listing = await prisma.listing.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ListingFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingFindFirstArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first Listing that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingFindFirstOrThrowArgs} args - Arguments to find a Listing
     * @example
     * // Get one Listing
     * const listing = await prisma.listing.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ListingFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more Listings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Listings
     * const listings = await prisma.listing.findMany()
     * 
     * // Get first 10 Listings
     * const listings = await prisma.listing.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const listingWithIdOnly = await prisma.listing.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ListingFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a Listing.
     * @param {ListingCreateArgs} args - Arguments to create a Listing.
     * @example
     * // Create one Listing
     * const Listing = await prisma.listing.create({
     *   data: {
     *     // ... data to create a Listing
     *   }
     * })
     * 
    **/
    create<T extends ListingCreateArgs<ExtArgs>>(
      args: SelectSubset<T, ListingCreateArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many Listings.
     *     @param {ListingCreateManyArgs} args - Arguments to create many Listings.
     *     @example
     *     // Create many Listings
     *     const listing = await prisma.listing.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends ListingCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Listing.
     * @param {ListingDeleteArgs} args - Arguments to delete one Listing.
     * @example
     * // Delete one Listing
     * const Listing = await prisma.listing.delete({
     *   where: {
     *     // ... filter to delete one Listing
     *   }
     * })
     * 
    **/
    delete<T extends ListingDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, ListingDeleteArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one Listing.
     * @param {ListingUpdateArgs} args - Arguments to update one Listing.
     * @example
     * // Update one Listing
     * const listing = await prisma.listing.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ListingUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, ListingUpdateArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more Listings.
     * @param {ListingDeleteManyArgs} args - Arguments to filter Listings to delete.
     * @example
     * // Delete a few Listings
     * const { count } = await prisma.listing.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ListingDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Listings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Listings
     * const listing = await prisma.listing.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ListingUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, ListingUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Listing.
     * @param {ListingUpsertArgs} args - Arguments to update or create a Listing.
     * @example
     * // Update or create a Listing
     * const listing = await prisma.listing.upsert({
     *   create: {
     *     // ... data to create a Listing
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Listing we want to update
     *   }
     * })
    **/
    upsert<T extends ListingUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, ListingUpsertArgs<ExtArgs>>
    ): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of Listings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingCountArgs} args - Arguments to filter Listings to count.
     * @example
     * // Count the number of Listings
     * const count = await prisma.listing.count({
     *   where: {
     *     // ... the filter for the Listings we want to count
     *   }
     * })
    **/
    count<T extends ListingCountArgs>(
      args?: Subset<T, ListingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ListingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Listing.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ListingAggregateArgs>(args: Subset<T, ListingAggregateArgs>): Prisma.PrismaPromise<GetListingAggregateType<T>>

    /**
     * Group by Listing.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ListingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ListingGroupByArgs['orderBy'] }
        : { orderBy?: ListingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ListingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetListingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Listing model
   */
  readonly fields: ListingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Listing.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ListingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    amenities<T extends Listing$amenitiesArgs<ExtArgs> = {}>(args?: Subset<T, Listing$amenitiesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findMany'> | Null>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the Listing model
   */ 
  interface ListingFieldRefs {
    readonly id: FieldRef<"Listing", 'String'>
    readonly title: FieldRef<"Listing", 'String'>
    readonly description: FieldRef<"Listing", 'String'>
    readonly costPerNight: FieldRef<"Listing", 'Float'>
    readonly hostId: FieldRef<"Listing", 'String'>
    readonly locationType: FieldRef<"Listing", 'String'>
    readonly numOfBeds: FieldRef<"Listing", 'Int'>
    readonly photoThumbnail: FieldRef<"Listing", 'String'>
    readonly isFeatured: FieldRef<"Listing", 'Boolean'>
  }
    

  // Custom InputTypes

  /**
   * Listing findUnique
   */
  export type ListingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter, which Listing to fetch.
     */
    where: ListingWhereUniqueInput
  }


  /**
   * Listing findUniqueOrThrow
   */
  export type ListingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter, which Listing to fetch.
     */
    where: ListingWhereUniqueInput
  }


  /**
   * Listing findFirst
   */
  export type ListingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter, which Listing to fetch.
     */
    where?: ListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Listings to fetch.
     */
    orderBy?: ListingOrderByWithRelationInput | ListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Listings.
     */
    cursor?: ListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Listings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Listings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Listings.
     */
    distinct?: ListingScalarFieldEnum | ListingScalarFieldEnum[]
  }


  /**
   * Listing findFirstOrThrow
   */
  export type ListingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter, which Listing to fetch.
     */
    where?: ListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Listings to fetch.
     */
    orderBy?: ListingOrderByWithRelationInput | ListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Listings.
     */
    cursor?: ListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Listings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Listings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Listings.
     */
    distinct?: ListingScalarFieldEnum | ListingScalarFieldEnum[]
  }


  /**
   * Listing findMany
   */
  export type ListingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter, which Listings to fetch.
     */
    where?: ListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Listings to fetch.
     */
    orderBy?: ListingOrderByWithRelationInput | ListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Listings.
     */
    cursor?: ListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Listings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Listings.
     */
    skip?: number
    distinct?: ListingScalarFieldEnum | ListingScalarFieldEnum[]
  }


  /**
   * Listing create
   */
  export type ListingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * The data needed to create a Listing.
     */
    data: XOR<ListingCreateInput, ListingUncheckedCreateInput>
  }


  /**
   * Listing createMany
   */
  export type ListingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Listings.
     */
    data: ListingCreateManyInput | ListingCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * Listing update
   */
  export type ListingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * The data needed to update a Listing.
     */
    data: XOR<ListingUpdateInput, ListingUncheckedUpdateInput>
    /**
     * Choose, which Listing to update.
     */
    where: ListingWhereUniqueInput
  }


  /**
   * Listing updateMany
   */
  export type ListingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Listings.
     */
    data: XOR<ListingUpdateManyMutationInput, ListingUncheckedUpdateManyInput>
    /**
     * Filter which Listings to update
     */
    where?: ListingWhereInput
  }


  /**
   * Listing upsert
   */
  export type ListingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * The filter to search for the Listing to update in case it exists.
     */
    where: ListingWhereUniqueInput
    /**
     * In case the Listing found by the `where` argument doesn't exist, create a new Listing with this data.
     */
    create: XOR<ListingCreateInput, ListingUncheckedCreateInput>
    /**
     * In case the Listing was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ListingUpdateInput, ListingUncheckedUpdateInput>
  }


  /**
   * Listing delete
   */
  export type ListingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
    /**
     * Filter which Listing to delete.
     */
    where: ListingWhereUniqueInput
  }


  /**
   * Listing deleteMany
   */
  export type ListingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Listings to delete
     */
    where?: ListingWhereInput
  }


  /**
   * Listing.amenities
   */
  export type Listing$amenitiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    where?: ListingAmenitiesWhereInput
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    cursor?: ListingAmenitiesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ListingAmenitiesScalarFieldEnum | ListingAmenitiesScalarFieldEnum[]
  }


  /**
   * Listing without action
   */
  export type ListingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Listing
     */
    select?: ListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingInclude<ExtArgs> | null
  }



  /**
   * Model ListingAmenities
   */

  export type AggregateListingAmenities = {
    _count: ListingAmenitiesCountAggregateOutputType | null
    _min: ListingAmenitiesMinAggregateOutputType | null
    _max: ListingAmenitiesMaxAggregateOutputType | null
  }

  export type ListingAmenitiesMinAggregateOutputType = {
    id: string | null
    listingId: string | null
    amenityId: string | null
  }

  export type ListingAmenitiesMaxAggregateOutputType = {
    id: string | null
    listingId: string | null
    amenityId: string | null
  }

  export type ListingAmenitiesCountAggregateOutputType = {
    id: number
    listingId: number
    amenityId: number
    _all: number
  }


  export type ListingAmenitiesMinAggregateInputType = {
    id?: true
    listingId?: true
    amenityId?: true
  }

  export type ListingAmenitiesMaxAggregateInputType = {
    id?: true
    listingId?: true
    amenityId?: true
  }

  export type ListingAmenitiesCountAggregateInputType = {
    id?: true
    listingId?: true
    amenityId?: true
    _all?: true
  }

  export type ListingAmenitiesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ListingAmenities to aggregate.
     */
    where?: ListingAmenitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ListingAmenities to fetch.
     */
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ListingAmenitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ListingAmenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ListingAmenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ListingAmenities
    **/
    _count?: true | ListingAmenitiesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ListingAmenitiesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ListingAmenitiesMaxAggregateInputType
  }

  export type GetListingAmenitiesAggregateType<T extends ListingAmenitiesAggregateArgs> = {
        [P in keyof T & keyof AggregateListingAmenities]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateListingAmenities[P]>
      : GetScalarType<T[P], AggregateListingAmenities[P]>
  }




  export type ListingAmenitiesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ListingAmenitiesWhereInput
    orderBy?: ListingAmenitiesOrderByWithAggregationInput | ListingAmenitiesOrderByWithAggregationInput[]
    by: ListingAmenitiesScalarFieldEnum[] | ListingAmenitiesScalarFieldEnum
    having?: ListingAmenitiesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ListingAmenitiesCountAggregateInputType | true
    _min?: ListingAmenitiesMinAggregateInputType
    _max?: ListingAmenitiesMaxAggregateInputType
  }

  export type ListingAmenitiesGroupByOutputType = {
    id: string
    listingId: string
    amenityId: string
    _count: ListingAmenitiesCountAggregateOutputType | null
    _min: ListingAmenitiesMinAggregateOutputType | null
    _max: ListingAmenitiesMaxAggregateOutputType | null
  }

  type GetListingAmenitiesGroupByPayload<T extends ListingAmenitiesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ListingAmenitiesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ListingAmenitiesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ListingAmenitiesGroupByOutputType[P]>
            : GetScalarType<T[P], ListingAmenitiesGroupByOutputType[P]>
        }
      >
    >


  export type ListingAmenitiesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listingId?: boolean
    amenityId?: boolean
    listing?: boolean | ListingDefaultArgs<ExtArgs>
    amenity?: boolean | AmenityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["listingAmenities"]>

  export type ListingAmenitiesSelectScalar = {
    id?: boolean
    listingId?: boolean
    amenityId?: boolean
  }

  export type ListingAmenitiesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    listing?: boolean | ListingDefaultArgs<ExtArgs>
    amenity?: boolean | AmenityDefaultArgs<ExtArgs>
  }


  export type $ListingAmenitiesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ListingAmenities"
    objects: {
      listing: Prisma.$ListingPayload<ExtArgs>
      amenity: Prisma.$AmenityPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      listingId: string
      amenityId: string
    }, ExtArgs["result"]["listingAmenities"]>
    composites: {}
  }


  type ListingAmenitiesGetPayload<S extends boolean | null | undefined | ListingAmenitiesDefaultArgs> = $Result.GetResult<Prisma.$ListingAmenitiesPayload, S>

  type ListingAmenitiesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ListingAmenitiesFindManyArgs, 'select' | 'include'> & {
      select?: ListingAmenitiesCountAggregateInputType | true
    }

  export interface ListingAmenitiesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ListingAmenities'], meta: { name: 'ListingAmenities' } }
    /**
     * Find zero or one ListingAmenities that matches the filter.
     * @param {ListingAmenitiesFindUniqueArgs} args - Arguments to find a ListingAmenities
     * @example
     * // Get one ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ListingAmenitiesFindUniqueArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesFindUniqueArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findUnique'> | null, null, ExtArgs>

    /**
     * Find one ListingAmenities that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ListingAmenitiesFindUniqueOrThrowArgs} args - Arguments to find a ListingAmenities
     * @example
     * // Get one ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ListingAmenitiesFindUniqueOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesFindUniqueOrThrowArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findUniqueOrThrow'>, never, ExtArgs>

    /**
     * Find the first ListingAmenities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesFindFirstArgs} args - Arguments to find a ListingAmenities
     * @example
     * // Get one ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ListingAmenitiesFindFirstArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesFindFirstArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findFirst'> | null, null, ExtArgs>

    /**
     * Find the first ListingAmenities that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesFindFirstOrThrowArgs} args - Arguments to find a ListingAmenities
     * @example
     * // Get one ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ListingAmenitiesFindFirstOrThrowArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesFindFirstOrThrowArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findFirstOrThrow'>, never, ExtArgs>

    /**
     * Find zero or more ListingAmenities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findMany()
     * 
     * // Get first 10 ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const listingAmenitiesWithIdOnly = await prisma.listingAmenities.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ListingAmenitiesFindManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesFindManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'findMany'>>

    /**
     * Create a ListingAmenities.
     * @param {ListingAmenitiesCreateArgs} args - Arguments to create a ListingAmenities.
     * @example
     * // Create one ListingAmenities
     * const ListingAmenities = await prisma.listingAmenities.create({
     *   data: {
     *     // ... data to create a ListingAmenities
     *   }
     * })
     * 
    **/
    create<T extends ListingAmenitiesCreateArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesCreateArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'create'>, never, ExtArgs>

    /**
     * Create many ListingAmenities.
     *     @param {ListingAmenitiesCreateManyArgs} args - Arguments to create many ListingAmenities.
     *     @example
     *     // Create many ListingAmenities
     *     const listingAmenities = await prisma.listingAmenities.createMany({
     *       data: {
     *         // ... provide data here
     *       }
     *     })
     *     
    **/
    createMany<T extends ListingAmenitiesCreateManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesCreateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ListingAmenities.
     * @param {ListingAmenitiesDeleteArgs} args - Arguments to delete one ListingAmenities.
     * @example
     * // Delete one ListingAmenities
     * const ListingAmenities = await prisma.listingAmenities.delete({
     *   where: {
     *     // ... filter to delete one ListingAmenities
     *   }
     * })
     * 
    **/
    delete<T extends ListingAmenitiesDeleteArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesDeleteArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'delete'>, never, ExtArgs>

    /**
     * Update one ListingAmenities.
     * @param {ListingAmenitiesUpdateArgs} args - Arguments to update one ListingAmenities.
     * @example
     * // Update one ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ListingAmenitiesUpdateArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesUpdateArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'update'>, never, ExtArgs>

    /**
     * Delete zero or more ListingAmenities.
     * @param {ListingAmenitiesDeleteManyArgs} args - Arguments to filter ListingAmenities to delete.
     * @example
     * // Delete a few ListingAmenities
     * const { count } = await prisma.listingAmenities.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ListingAmenitiesDeleteManyArgs<ExtArgs>>(
      args?: SelectSubset<T, ListingAmenitiesDeleteManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ListingAmenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ListingAmenitiesUpdateManyArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesUpdateManyArgs<ExtArgs>>
    ): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ListingAmenities.
     * @param {ListingAmenitiesUpsertArgs} args - Arguments to update or create a ListingAmenities.
     * @example
     * // Update or create a ListingAmenities
     * const listingAmenities = await prisma.listingAmenities.upsert({
     *   create: {
     *     // ... data to create a ListingAmenities
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ListingAmenities we want to update
     *   }
     * })
    **/
    upsert<T extends ListingAmenitiesUpsertArgs<ExtArgs>>(
      args: SelectSubset<T, ListingAmenitiesUpsertArgs<ExtArgs>>
    ): Prisma__ListingAmenitiesClient<$Result.GetResult<Prisma.$ListingAmenitiesPayload<ExtArgs>, T, 'upsert'>, never, ExtArgs>

    /**
     * Count the number of ListingAmenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesCountArgs} args - Arguments to filter ListingAmenities to count.
     * @example
     * // Count the number of ListingAmenities
     * const count = await prisma.listingAmenities.count({
     *   where: {
     *     // ... the filter for the ListingAmenities we want to count
     *   }
     * })
    **/
    count<T extends ListingAmenitiesCountArgs>(
      args?: Subset<T, ListingAmenitiesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ListingAmenitiesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ListingAmenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ListingAmenitiesAggregateArgs>(args: Subset<T, ListingAmenitiesAggregateArgs>): Prisma.PrismaPromise<GetListingAmenitiesAggregateType<T>>

    /**
     * Group by ListingAmenities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ListingAmenitiesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ListingAmenitiesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ListingAmenitiesGroupByArgs['orderBy'] }
        : { orderBy?: ListingAmenitiesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ListingAmenitiesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetListingAmenitiesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ListingAmenities model
   */
  readonly fields: ListingAmenitiesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ListingAmenities.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ListingAmenitiesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';

    listing<T extends ListingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ListingDefaultArgs<ExtArgs>>): Prisma__ListingClient<$Result.GetResult<Prisma.$ListingPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    amenity<T extends AmenityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AmenityDefaultArgs<ExtArgs>>): Prisma__AmenityClient<$Result.GetResult<Prisma.$AmenityPayload<ExtArgs>, T, 'findUniqueOrThrow'> | Null, Null, ExtArgs>;

    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }



  /**
   * Fields of the ListingAmenities model
   */ 
  interface ListingAmenitiesFieldRefs {
    readonly id: FieldRef<"ListingAmenities", 'String'>
    readonly listingId: FieldRef<"ListingAmenities", 'String'>
    readonly amenityId: FieldRef<"ListingAmenities", 'String'>
  }
    

  // Custom InputTypes

  /**
   * ListingAmenities findUnique
   */
  export type ListingAmenitiesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter, which ListingAmenities to fetch.
     */
    where: ListingAmenitiesWhereUniqueInput
  }


  /**
   * ListingAmenities findUniqueOrThrow
   */
  export type ListingAmenitiesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter, which ListingAmenities to fetch.
     */
    where: ListingAmenitiesWhereUniqueInput
  }


  /**
   * ListingAmenities findFirst
   */
  export type ListingAmenitiesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter, which ListingAmenities to fetch.
     */
    where?: ListingAmenitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ListingAmenities to fetch.
     */
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ListingAmenities.
     */
    cursor?: ListingAmenitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ListingAmenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ListingAmenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ListingAmenities.
     */
    distinct?: ListingAmenitiesScalarFieldEnum | ListingAmenitiesScalarFieldEnum[]
  }


  /**
   * ListingAmenities findFirstOrThrow
   */
  export type ListingAmenitiesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter, which ListingAmenities to fetch.
     */
    where?: ListingAmenitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ListingAmenities to fetch.
     */
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ListingAmenities.
     */
    cursor?: ListingAmenitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ListingAmenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ListingAmenities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ListingAmenities.
     */
    distinct?: ListingAmenitiesScalarFieldEnum | ListingAmenitiesScalarFieldEnum[]
  }


  /**
   * ListingAmenities findMany
   */
  export type ListingAmenitiesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter, which ListingAmenities to fetch.
     */
    where?: ListingAmenitiesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ListingAmenities to fetch.
     */
    orderBy?: ListingAmenitiesOrderByWithRelationInput | ListingAmenitiesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ListingAmenities.
     */
    cursor?: ListingAmenitiesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ListingAmenities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ListingAmenities.
     */
    skip?: number
    distinct?: ListingAmenitiesScalarFieldEnum | ListingAmenitiesScalarFieldEnum[]
  }


  /**
   * ListingAmenities create
   */
  export type ListingAmenitiesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * The data needed to create a ListingAmenities.
     */
    data: XOR<ListingAmenitiesCreateInput, ListingAmenitiesUncheckedCreateInput>
  }


  /**
   * ListingAmenities createMany
   */
  export type ListingAmenitiesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ListingAmenities.
     */
    data: ListingAmenitiesCreateManyInput | ListingAmenitiesCreateManyInput[]
    skipDuplicates?: boolean
  }


  /**
   * ListingAmenities update
   */
  export type ListingAmenitiesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * The data needed to update a ListingAmenities.
     */
    data: XOR<ListingAmenitiesUpdateInput, ListingAmenitiesUncheckedUpdateInput>
    /**
     * Choose, which ListingAmenities to update.
     */
    where: ListingAmenitiesWhereUniqueInput
  }


  /**
   * ListingAmenities updateMany
   */
  export type ListingAmenitiesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ListingAmenities.
     */
    data: XOR<ListingAmenitiesUpdateManyMutationInput, ListingAmenitiesUncheckedUpdateManyInput>
    /**
     * Filter which ListingAmenities to update
     */
    where?: ListingAmenitiesWhereInput
  }


  /**
   * ListingAmenities upsert
   */
  export type ListingAmenitiesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * The filter to search for the ListingAmenities to update in case it exists.
     */
    where: ListingAmenitiesWhereUniqueInput
    /**
     * In case the ListingAmenities found by the `where` argument doesn't exist, create a new ListingAmenities with this data.
     */
    create: XOR<ListingAmenitiesCreateInput, ListingAmenitiesUncheckedCreateInput>
    /**
     * In case the ListingAmenities was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ListingAmenitiesUpdateInput, ListingAmenitiesUncheckedUpdateInput>
  }


  /**
   * ListingAmenities delete
   */
  export type ListingAmenitiesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
    /**
     * Filter which ListingAmenities to delete.
     */
    where: ListingAmenitiesWhereUniqueInput
  }


  /**
   * ListingAmenities deleteMany
   */
  export type ListingAmenitiesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ListingAmenities to delete
     */
    where?: ListingAmenitiesWhereInput
  }


  /**
   * ListingAmenities without action
   */
  export type ListingAmenitiesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ListingAmenities
     */
    select?: ListingAmenitiesSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well.
     */
    include?: ListingAmenitiesInclude<ExtArgs> | null
  }



  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AmenityScalarFieldEnum: {
    id: 'id',
    category: 'category',
    name: 'name'
  };

  export type AmenityScalarFieldEnum = (typeof AmenityScalarFieldEnum)[keyof typeof AmenityScalarFieldEnum]


  export const ListingScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    costPerNight: 'costPerNight',
    hostId: 'hostId',
    locationType: 'locationType',
    numOfBeds: 'numOfBeds',
    photoThumbnail: 'photoThumbnail',
    isFeatured: 'isFeatured'
  };

  export type ListingScalarFieldEnum = (typeof ListingScalarFieldEnum)[keyof typeof ListingScalarFieldEnum]


  export const ListingAmenitiesScalarFieldEnum: {
    id: 'id',
    listingId: 'listingId',
    amenityId: 'amenityId'
  };

  export type ListingAmenitiesScalarFieldEnum = (typeof ListingAmenitiesScalarFieldEnum)[keyof typeof ListingAmenitiesScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type AmenityWhereInput = {
    AND?: AmenityWhereInput | AmenityWhereInput[]
    OR?: AmenityWhereInput[]
    NOT?: AmenityWhereInput | AmenityWhereInput[]
    id?: StringFilter<"Amenity"> | string
    category?: StringFilter<"Amenity"> | string
    name?: StringFilter<"Amenity"> | string
    listing?: ListingAmenitiesListRelationFilter
  }

  export type AmenityOrderByWithRelationInput = {
    id?: SortOrder
    category?: SortOrder
    name?: SortOrder
    listing?: ListingAmenitiesOrderByRelationAggregateInput
  }

  export type AmenityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AmenityWhereInput | AmenityWhereInput[]
    OR?: AmenityWhereInput[]
    NOT?: AmenityWhereInput | AmenityWhereInput[]
    category?: StringFilter<"Amenity"> | string
    name?: StringFilter<"Amenity"> | string
    listing?: ListingAmenitiesListRelationFilter
  }, "id">

  export type AmenityOrderByWithAggregationInput = {
    id?: SortOrder
    category?: SortOrder
    name?: SortOrder
    _count?: AmenityCountOrderByAggregateInput
    _max?: AmenityMaxOrderByAggregateInput
    _min?: AmenityMinOrderByAggregateInput
  }

  export type AmenityScalarWhereWithAggregatesInput = {
    AND?: AmenityScalarWhereWithAggregatesInput | AmenityScalarWhereWithAggregatesInput[]
    OR?: AmenityScalarWhereWithAggregatesInput[]
    NOT?: AmenityScalarWhereWithAggregatesInput | AmenityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Amenity"> | string
    category?: StringWithAggregatesFilter<"Amenity"> | string
    name?: StringWithAggregatesFilter<"Amenity"> | string
  }

  export type ListingWhereInput = {
    AND?: ListingWhereInput | ListingWhereInput[]
    OR?: ListingWhereInput[]
    NOT?: ListingWhereInput | ListingWhereInput[]
    id?: StringFilter<"Listing"> | string
    title?: StringFilter<"Listing"> | string
    description?: StringFilter<"Listing"> | string
    costPerNight?: FloatFilter<"Listing"> | number
    hostId?: StringFilter<"Listing"> | string
    locationType?: StringFilter<"Listing"> | string
    numOfBeds?: IntFilter<"Listing"> | number
    photoThumbnail?: StringFilter<"Listing"> | string
    isFeatured?: BoolNullableFilter<"Listing"> | boolean | null
    amenities?: ListingAmenitiesListRelationFilter
  }

  export type ListingOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    costPerNight?: SortOrder
    hostId?: SortOrder
    locationType?: SortOrder
    numOfBeds?: SortOrder
    photoThumbnail?: SortOrder
    isFeatured?: SortOrderInput | SortOrder
    amenities?: ListingAmenitiesOrderByRelationAggregateInput
  }

  export type ListingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ListingWhereInput | ListingWhereInput[]
    OR?: ListingWhereInput[]
    NOT?: ListingWhereInput | ListingWhereInput[]
    title?: StringFilter<"Listing"> | string
    description?: StringFilter<"Listing"> | string
    costPerNight?: FloatFilter<"Listing"> | number
    hostId?: StringFilter<"Listing"> | string
    locationType?: StringFilter<"Listing"> | string
    numOfBeds?: IntFilter<"Listing"> | number
    photoThumbnail?: StringFilter<"Listing"> | string
    isFeatured?: BoolNullableFilter<"Listing"> | boolean | null
    amenities?: ListingAmenitiesListRelationFilter
  }, "id">

  export type ListingOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    costPerNight?: SortOrder
    hostId?: SortOrder
    locationType?: SortOrder
    numOfBeds?: SortOrder
    photoThumbnail?: SortOrder
    isFeatured?: SortOrderInput | SortOrder
    _count?: ListingCountOrderByAggregateInput
    _avg?: ListingAvgOrderByAggregateInput
    _max?: ListingMaxOrderByAggregateInput
    _min?: ListingMinOrderByAggregateInput
    _sum?: ListingSumOrderByAggregateInput
  }

  export type ListingScalarWhereWithAggregatesInput = {
    AND?: ListingScalarWhereWithAggregatesInput | ListingScalarWhereWithAggregatesInput[]
    OR?: ListingScalarWhereWithAggregatesInput[]
    NOT?: ListingScalarWhereWithAggregatesInput | ListingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Listing"> | string
    title?: StringWithAggregatesFilter<"Listing"> | string
    description?: StringWithAggregatesFilter<"Listing"> | string
    costPerNight?: FloatWithAggregatesFilter<"Listing"> | number
    hostId?: StringWithAggregatesFilter<"Listing"> | string
    locationType?: StringWithAggregatesFilter<"Listing"> | string
    numOfBeds?: IntWithAggregatesFilter<"Listing"> | number
    photoThumbnail?: StringWithAggregatesFilter<"Listing"> | string
    isFeatured?: BoolNullableWithAggregatesFilter<"Listing"> | boolean | null
  }

  export type ListingAmenitiesWhereInput = {
    AND?: ListingAmenitiesWhereInput | ListingAmenitiesWhereInput[]
    OR?: ListingAmenitiesWhereInput[]
    NOT?: ListingAmenitiesWhereInput | ListingAmenitiesWhereInput[]
    id?: StringFilter<"ListingAmenities"> | string
    listingId?: StringFilter<"ListingAmenities"> | string
    amenityId?: StringFilter<"ListingAmenities"> | string
    listing?: XOR<ListingRelationFilter, ListingWhereInput>
    amenity?: XOR<AmenityRelationFilter, AmenityWhereInput>
  }

  export type ListingAmenitiesOrderByWithRelationInput = {
    id?: SortOrder
    listingId?: SortOrder
    amenityId?: SortOrder
    listing?: ListingOrderByWithRelationInput
    amenity?: AmenityOrderByWithRelationInput
  }

  export type ListingAmenitiesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ListingAmenitiesWhereInput | ListingAmenitiesWhereInput[]
    OR?: ListingAmenitiesWhereInput[]
    NOT?: ListingAmenitiesWhereInput | ListingAmenitiesWhereInput[]
    listingId?: StringFilter<"ListingAmenities"> | string
    amenityId?: StringFilter<"ListingAmenities"> | string
    listing?: XOR<ListingRelationFilter, ListingWhereInput>
    amenity?: XOR<AmenityRelationFilter, AmenityWhereInput>
  }, "id">

  export type ListingAmenitiesOrderByWithAggregationInput = {
    id?: SortOrder
    listingId?: SortOrder
    amenityId?: SortOrder
    _count?: ListingAmenitiesCountOrderByAggregateInput
    _max?: ListingAmenitiesMaxOrderByAggregateInput
    _min?: ListingAmenitiesMinOrderByAggregateInput
  }

  export type ListingAmenitiesScalarWhereWithAggregatesInput = {
    AND?: ListingAmenitiesScalarWhereWithAggregatesInput | ListingAmenitiesScalarWhereWithAggregatesInput[]
    OR?: ListingAmenitiesScalarWhereWithAggregatesInput[]
    NOT?: ListingAmenitiesScalarWhereWithAggregatesInput | ListingAmenitiesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ListingAmenities"> | string
    listingId?: StringWithAggregatesFilter<"ListingAmenities"> | string
    amenityId?: StringWithAggregatesFilter<"ListingAmenities"> | string
  }

  export type AmenityCreateInput = {
    id: string
    category: string
    name: string
    listing?: ListingAmenitiesCreateNestedManyWithoutAmenityInput
  }

  export type AmenityUncheckedCreateInput = {
    id: string
    category: string
    name: string
    listing?: ListingAmenitiesUncheckedCreateNestedManyWithoutAmenityInput
  }

  export type AmenityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    listing?: ListingAmenitiesUpdateManyWithoutAmenityNestedInput
  }

  export type AmenityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    listing?: ListingAmenitiesUncheckedUpdateManyWithoutAmenityNestedInput
  }

  export type AmenityCreateManyInput = {
    id: string
    category: string
    name: string
  }

  export type AmenityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AmenityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ListingCreateInput = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured?: boolean | null
    amenities?: ListingAmenitiesCreateNestedManyWithoutListingInput
  }

  export type ListingUncheckedCreateInput = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured?: boolean | null
    amenities?: ListingAmenitiesUncheckedCreateNestedManyWithoutListingInput
  }

  export type ListingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
    amenities?: ListingAmenitiesUpdateManyWithoutListingNestedInput
  }

  export type ListingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
    amenities?: ListingAmenitiesUncheckedUpdateManyWithoutListingNestedInput
  }

  export type ListingCreateManyInput = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured?: boolean | null
  }

  export type ListingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type ListingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type ListingAmenitiesCreateInput = {
    id: string
    listing: ListingCreateNestedOneWithoutAmenitiesInput
    amenity: AmenityCreateNestedOneWithoutListingInput
  }

  export type ListingAmenitiesUncheckedCreateInput = {
    id: string
    listingId: string
    amenityId: string
  }

  export type ListingAmenitiesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    listing?: ListingUpdateOneRequiredWithoutAmenitiesNestedInput
    amenity?: AmenityUpdateOneRequiredWithoutListingNestedInput
  }

  export type ListingAmenitiesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
    amenityId?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesCreateManyInput = {
    id: string
    listingId: string
    amenityId: string
  }

  export type ListingAmenitiesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
    amenityId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type ListingAmenitiesListRelationFilter = {
    every?: ListingAmenitiesWhereInput
    some?: ListingAmenitiesWhereInput
    none?: ListingAmenitiesWhereInput
  }

  export type ListingAmenitiesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AmenityCountOrderByAggregateInput = {
    id?: SortOrder
    category?: SortOrder
    name?: SortOrder
  }

  export type AmenityMaxOrderByAggregateInput = {
    id?: SortOrder
    category?: SortOrder
    name?: SortOrder
  }

  export type AmenityMinOrderByAggregateInput = {
    id?: SortOrder
    category?: SortOrder
    name?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ListingCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    costPerNight?: SortOrder
    hostId?: SortOrder
    locationType?: SortOrder
    numOfBeds?: SortOrder
    photoThumbnail?: SortOrder
    isFeatured?: SortOrder
  }

  export type ListingAvgOrderByAggregateInput = {
    costPerNight?: SortOrder
    numOfBeds?: SortOrder
  }

  export type ListingMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    costPerNight?: SortOrder
    hostId?: SortOrder
    locationType?: SortOrder
    numOfBeds?: SortOrder
    photoThumbnail?: SortOrder
    isFeatured?: SortOrder
  }

  export type ListingMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    costPerNight?: SortOrder
    hostId?: SortOrder
    locationType?: SortOrder
    numOfBeds?: SortOrder
    photoThumbnail?: SortOrder
    isFeatured?: SortOrder
  }

  export type ListingSumOrderByAggregateInput = {
    costPerNight?: SortOrder
    numOfBeds?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type ListingRelationFilter = {
    is?: ListingWhereInput
    isNot?: ListingWhereInput
  }

  export type AmenityRelationFilter = {
    is?: AmenityWhereInput
    isNot?: AmenityWhereInput
  }

  export type ListingAmenitiesCountOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    amenityId?: SortOrder
  }

  export type ListingAmenitiesMaxOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    amenityId?: SortOrder
  }

  export type ListingAmenitiesMinOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    amenityId?: SortOrder
  }

  export type ListingAmenitiesCreateNestedManyWithoutAmenityInput = {
    create?: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput> | ListingAmenitiesCreateWithoutAmenityInput[] | ListingAmenitiesUncheckedCreateWithoutAmenityInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutAmenityInput | ListingAmenitiesCreateOrConnectWithoutAmenityInput[]
    createMany?: ListingAmenitiesCreateManyAmenityInputEnvelope
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
  }

  export type ListingAmenitiesUncheckedCreateNestedManyWithoutAmenityInput = {
    create?: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput> | ListingAmenitiesCreateWithoutAmenityInput[] | ListingAmenitiesUncheckedCreateWithoutAmenityInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutAmenityInput | ListingAmenitiesCreateOrConnectWithoutAmenityInput[]
    createMany?: ListingAmenitiesCreateManyAmenityInputEnvelope
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type ListingAmenitiesUpdateManyWithoutAmenityNestedInput = {
    create?: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput> | ListingAmenitiesCreateWithoutAmenityInput[] | ListingAmenitiesUncheckedCreateWithoutAmenityInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutAmenityInput | ListingAmenitiesCreateOrConnectWithoutAmenityInput[]
    upsert?: ListingAmenitiesUpsertWithWhereUniqueWithoutAmenityInput | ListingAmenitiesUpsertWithWhereUniqueWithoutAmenityInput[]
    createMany?: ListingAmenitiesCreateManyAmenityInputEnvelope
    set?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    disconnect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    delete?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    update?: ListingAmenitiesUpdateWithWhereUniqueWithoutAmenityInput | ListingAmenitiesUpdateWithWhereUniqueWithoutAmenityInput[]
    updateMany?: ListingAmenitiesUpdateManyWithWhereWithoutAmenityInput | ListingAmenitiesUpdateManyWithWhereWithoutAmenityInput[]
    deleteMany?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
  }

  export type ListingAmenitiesUncheckedUpdateManyWithoutAmenityNestedInput = {
    create?: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput> | ListingAmenitiesCreateWithoutAmenityInput[] | ListingAmenitiesUncheckedCreateWithoutAmenityInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutAmenityInput | ListingAmenitiesCreateOrConnectWithoutAmenityInput[]
    upsert?: ListingAmenitiesUpsertWithWhereUniqueWithoutAmenityInput | ListingAmenitiesUpsertWithWhereUniqueWithoutAmenityInput[]
    createMany?: ListingAmenitiesCreateManyAmenityInputEnvelope
    set?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    disconnect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    delete?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    update?: ListingAmenitiesUpdateWithWhereUniqueWithoutAmenityInput | ListingAmenitiesUpdateWithWhereUniqueWithoutAmenityInput[]
    updateMany?: ListingAmenitiesUpdateManyWithWhereWithoutAmenityInput | ListingAmenitiesUpdateManyWithWhereWithoutAmenityInput[]
    deleteMany?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
  }

  export type ListingAmenitiesCreateNestedManyWithoutListingInput = {
    create?: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput> | ListingAmenitiesCreateWithoutListingInput[] | ListingAmenitiesUncheckedCreateWithoutListingInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutListingInput | ListingAmenitiesCreateOrConnectWithoutListingInput[]
    createMany?: ListingAmenitiesCreateManyListingInputEnvelope
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
  }

  export type ListingAmenitiesUncheckedCreateNestedManyWithoutListingInput = {
    create?: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput> | ListingAmenitiesCreateWithoutListingInput[] | ListingAmenitiesUncheckedCreateWithoutListingInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutListingInput | ListingAmenitiesCreateOrConnectWithoutListingInput[]
    createMany?: ListingAmenitiesCreateManyListingInputEnvelope
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type ListingAmenitiesUpdateManyWithoutListingNestedInput = {
    create?: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput> | ListingAmenitiesCreateWithoutListingInput[] | ListingAmenitiesUncheckedCreateWithoutListingInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutListingInput | ListingAmenitiesCreateOrConnectWithoutListingInput[]
    upsert?: ListingAmenitiesUpsertWithWhereUniqueWithoutListingInput | ListingAmenitiesUpsertWithWhereUniqueWithoutListingInput[]
    createMany?: ListingAmenitiesCreateManyListingInputEnvelope
    set?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    disconnect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    delete?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    update?: ListingAmenitiesUpdateWithWhereUniqueWithoutListingInput | ListingAmenitiesUpdateWithWhereUniqueWithoutListingInput[]
    updateMany?: ListingAmenitiesUpdateManyWithWhereWithoutListingInput | ListingAmenitiesUpdateManyWithWhereWithoutListingInput[]
    deleteMany?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
  }

  export type ListingAmenitiesUncheckedUpdateManyWithoutListingNestedInput = {
    create?: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput> | ListingAmenitiesCreateWithoutListingInput[] | ListingAmenitiesUncheckedCreateWithoutListingInput[]
    connectOrCreate?: ListingAmenitiesCreateOrConnectWithoutListingInput | ListingAmenitiesCreateOrConnectWithoutListingInput[]
    upsert?: ListingAmenitiesUpsertWithWhereUniqueWithoutListingInput | ListingAmenitiesUpsertWithWhereUniqueWithoutListingInput[]
    createMany?: ListingAmenitiesCreateManyListingInputEnvelope
    set?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    disconnect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    delete?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    connect?: ListingAmenitiesWhereUniqueInput | ListingAmenitiesWhereUniqueInput[]
    update?: ListingAmenitiesUpdateWithWhereUniqueWithoutListingInput | ListingAmenitiesUpdateWithWhereUniqueWithoutListingInput[]
    updateMany?: ListingAmenitiesUpdateManyWithWhereWithoutListingInput | ListingAmenitiesUpdateManyWithWhereWithoutListingInput[]
    deleteMany?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
  }

  export type ListingCreateNestedOneWithoutAmenitiesInput = {
    create?: XOR<ListingCreateWithoutAmenitiesInput, ListingUncheckedCreateWithoutAmenitiesInput>
    connectOrCreate?: ListingCreateOrConnectWithoutAmenitiesInput
    connect?: ListingWhereUniqueInput
  }

  export type AmenityCreateNestedOneWithoutListingInput = {
    create?: XOR<AmenityCreateWithoutListingInput, AmenityUncheckedCreateWithoutListingInput>
    connectOrCreate?: AmenityCreateOrConnectWithoutListingInput
    connect?: AmenityWhereUniqueInput
  }

  export type ListingUpdateOneRequiredWithoutAmenitiesNestedInput = {
    create?: XOR<ListingCreateWithoutAmenitiesInput, ListingUncheckedCreateWithoutAmenitiesInput>
    connectOrCreate?: ListingCreateOrConnectWithoutAmenitiesInput
    upsert?: ListingUpsertWithoutAmenitiesInput
    connect?: ListingWhereUniqueInput
    update?: XOR<XOR<ListingUpdateToOneWithWhereWithoutAmenitiesInput, ListingUpdateWithoutAmenitiesInput>, ListingUncheckedUpdateWithoutAmenitiesInput>
  }

  export type AmenityUpdateOneRequiredWithoutListingNestedInput = {
    create?: XOR<AmenityCreateWithoutListingInput, AmenityUncheckedCreateWithoutListingInput>
    connectOrCreate?: AmenityCreateOrConnectWithoutListingInput
    upsert?: AmenityUpsertWithoutListingInput
    connect?: AmenityWhereUniqueInput
    update?: XOR<XOR<AmenityUpdateToOneWithWhereWithoutListingInput, AmenityUpdateWithoutListingInput>, AmenityUncheckedUpdateWithoutListingInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ListingAmenitiesCreateWithoutAmenityInput = {
    id: string
    listing: ListingCreateNestedOneWithoutAmenitiesInput
  }

  export type ListingAmenitiesUncheckedCreateWithoutAmenityInput = {
    id: string
    listingId: string
  }

  export type ListingAmenitiesCreateOrConnectWithoutAmenityInput = {
    where: ListingAmenitiesWhereUniqueInput
    create: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput>
  }

  export type ListingAmenitiesCreateManyAmenityInputEnvelope = {
    data: ListingAmenitiesCreateManyAmenityInput | ListingAmenitiesCreateManyAmenityInput[]
    skipDuplicates?: boolean
  }

  export type ListingAmenitiesUpsertWithWhereUniqueWithoutAmenityInput = {
    where: ListingAmenitiesWhereUniqueInput
    update: XOR<ListingAmenitiesUpdateWithoutAmenityInput, ListingAmenitiesUncheckedUpdateWithoutAmenityInput>
    create: XOR<ListingAmenitiesCreateWithoutAmenityInput, ListingAmenitiesUncheckedCreateWithoutAmenityInput>
  }

  export type ListingAmenitiesUpdateWithWhereUniqueWithoutAmenityInput = {
    where: ListingAmenitiesWhereUniqueInput
    data: XOR<ListingAmenitiesUpdateWithoutAmenityInput, ListingAmenitiesUncheckedUpdateWithoutAmenityInput>
  }

  export type ListingAmenitiesUpdateManyWithWhereWithoutAmenityInput = {
    where: ListingAmenitiesScalarWhereInput
    data: XOR<ListingAmenitiesUpdateManyMutationInput, ListingAmenitiesUncheckedUpdateManyWithoutAmenityInput>
  }

  export type ListingAmenitiesScalarWhereInput = {
    AND?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
    OR?: ListingAmenitiesScalarWhereInput[]
    NOT?: ListingAmenitiesScalarWhereInput | ListingAmenitiesScalarWhereInput[]
    id?: StringFilter<"ListingAmenities"> | string
    listingId?: StringFilter<"ListingAmenities"> | string
    amenityId?: StringFilter<"ListingAmenities"> | string
  }

  export type ListingAmenitiesCreateWithoutListingInput = {
    id: string
    amenity: AmenityCreateNestedOneWithoutListingInput
  }

  export type ListingAmenitiesUncheckedCreateWithoutListingInput = {
    id: string
    amenityId: string
  }

  export type ListingAmenitiesCreateOrConnectWithoutListingInput = {
    where: ListingAmenitiesWhereUniqueInput
    create: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput>
  }

  export type ListingAmenitiesCreateManyListingInputEnvelope = {
    data: ListingAmenitiesCreateManyListingInput | ListingAmenitiesCreateManyListingInput[]
    skipDuplicates?: boolean
  }

  export type ListingAmenitiesUpsertWithWhereUniqueWithoutListingInput = {
    where: ListingAmenitiesWhereUniqueInput
    update: XOR<ListingAmenitiesUpdateWithoutListingInput, ListingAmenitiesUncheckedUpdateWithoutListingInput>
    create: XOR<ListingAmenitiesCreateWithoutListingInput, ListingAmenitiesUncheckedCreateWithoutListingInput>
  }

  export type ListingAmenitiesUpdateWithWhereUniqueWithoutListingInput = {
    where: ListingAmenitiesWhereUniqueInput
    data: XOR<ListingAmenitiesUpdateWithoutListingInput, ListingAmenitiesUncheckedUpdateWithoutListingInput>
  }

  export type ListingAmenitiesUpdateManyWithWhereWithoutListingInput = {
    where: ListingAmenitiesScalarWhereInput
    data: XOR<ListingAmenitiesUpdateManyMutationInput, ListingAmenitiesUncheckedUpdateManyWithoutListingInput>
  }

  export type ListingCreateWithoutAmenitiesInput = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured?: boolean | null
  }

  export type ListingUncheckedCreateWithoutAmenitiesInput = {
    id: string
    title: string
    description: string
    costPerNight: number
    hostId: string
    locationType: string
    numOfBeds: number
    photoThumbnail: string
    isFeatured?: boolean | null
  }

  export type ListingCreateOrConnectWithoutAmenitiesInput = {
    where: ListingWhereUniqueInput
    create: XOR<ListingCreateWithoutAmenitiesInput, ListingUncheckedCreateWithoutAmenitiesInput>
  }

  export type AmenityCreateWithoutListingInput = {
    id: string
    category: string
    name: string
  }

  export type AmenityUncheckedCreateWithoutListingInput = {
    id: string
    category: string
    name: string
  }

  export type AmenityCreateOrConnectWithoutListingInput = {
    where: AmenityWhereUniqueInput
    create: XOR<AmenityCreateWithoutListingInput, AmenityUncheckedCreateWithoutListingInput>
  }

  export type ListingUpsertWithoutAmenitiesInput = {
    update: XOR<ListingUpdateWithoutAmenitiesInput, ListingUncheckedUpdateWithoutAmenitiesInput>
    create: XOR<ListingCreateWithoutAmenitiesInput, ListingUncheckedCreateWithoutAmenitiesInput>
    where?: ListingWhereInput
  }

  export type ListingUpdateToOneWithWhereWithoutAmenitiesInput = {
    where?: ListingWhereInput
    data: XOR<ListingUpdateWithoutAmenitiesInput, ListingUncheckedUpdateWithoutAmenitiesInput>
  }

  export type ListingUpdateWithoutAmenitiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type ListingUncheckedUpdateWithoutAmenitiesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    costPerNight?: FloatFieldUpdateOperationsInput | number
    hostId?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    numOfBeds?: IntFieldUpdateOperationsInput | number
    photoThumbnail?: StringFieldUpdateOperationsInput | string
    isFeatured?: NullableBoolFieldUpdateOperationsInput | boolean | null
  }

  export type AmenityUpsertWithoutListingInput = {
    update: XOR<AmenityUpdateWithoutListingInput, AmenityUncheckedUpdateWithoutListingInput>
    create: XOR<AmenityCreateWithoutListingInput, AmenityUncheckedCreateWithoutListingInput>
    where?: AmenityWhereInput
  }

  export type AmenityUpdateToOneWithWhereWithoutListingInput = {
    where?: AmenityWhereInput
    data: XOR<AmenityUpdateWithoutListingInput, AmenityUncheckedUpdateWithoutListingInput>
  }

  export type AmenityUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type AmenityUncheckedUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesCreateManyAmenityInput = {
    id: string
    listingId: string
  }

  export type ListingAmenitiesUpdateWithoutAmenityInput = {
    id?: StringFieldUpdateOperationsInput | string
    listing?: ListingUpdateOneRequiredWithoutAmenitiesNestedInput
  }

  export type ListingAmenitiesUncheckedUpdateWithoutAmenityInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesUncheckedUpdateManyWithoutAmenityInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesCreateManyListingInput = {
    id: string
    amenityId: string
  }

  export type ListingAmenitiesUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    amenity?: AmenityUpdateOneRequiredWithoutListingNestedInput
  }

  export type ListingAmenitiesUncheckedUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    amenityId?: StringFieldUpdateOperationsInput | string
  }

  export type ListingAmenitiesUncheckedUpdateManyWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    amenityId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use AmenityCountOutputTypeDefaultArgs instead
     */
    export type AmenityCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AmenityCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ListingCountOutputTypeDefaultArgs instead
     */
    export type ListingCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ListingCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AmenityDefaultArgs instead
     */
    export type AmenityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AmenityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ListingDefaultArgs instead
     */
    export type ListingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ListingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ListingAmenitiesDefaultArgs instead
     */
    export type ListingAmenitiesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ListingAmenitiesDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}