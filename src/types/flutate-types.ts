import { Flatten, IsArray, IsObject } from './flatten-record-types'
import { CastoffArray } from './util-types'

/**
 * FlutateRecordPort
 *
 * @typeParam T - Target Record Type, for example to `Record<string, unknown>`
 */
interface RecordPort<T, F extends Flatten<T> = Flatten<T>> {
  /**
   * deep copy record value, and return new instance.
   */
  clone(): RecordPort<T, F>

  /**
   * Update specified parameter.
   *
   * @example
   * ```
   * // item = { a: 1, b: { c: 2 }, d: [{e: 3}] }
   * record
   *   .update('a', 10)
   *   .update('b.c', 20)
   *   .update('d', [{e: 30}])
   * // cannot
   * //.update('d[0].e', 30)
   *
   * ```
   *
   * @param path
   * @param value
   */
  update<
    N extends keyof F,
    V extends
      | F[N]
      | IsArray<
          F[N],
          MutateCollection<CastoffArray<F[N]>>,
          RecordMutateFunction<T, F[N]>
        > =
      | F[N]
      | IsArray<
          F[N],
          MutateCollection<CastoffArray<F[N]>>,
          RecordMutateFunction<T, F[N]>
        >,
  >(
    path: N,
    value: V,
  ): RecordPort<T, F>

  /**
   * Returns processed record value.
   */
  done(): T

  /**
   * Get value from record by dot's path
   *
   * @example
   * ```
   * const record = flutate({
   *   value: 'example',
   *   obj: {
   *      value: 'example',
   *   },
   *   ary: [{ id: 1, value: 'example_1' }]
   * })
   *
   * console.log(record.get('value')) // "example"
   * console.log(record.get('obj.value')) // "example"
   * console.log(record.get('ary')) // collection instance
   *
   * // finding in array element
   * const item = record.get('ary').find({ id: 1 }).done() // { id: 1, value: 'example_1' }
   * ```
   *
   * @param path
   */
  get<
    N extends keyof F,
    V extends IsArray<F[N], CollectionPort<CastoffArray<F[N]>>, F[N]>,
  >(
    path: N,
  ): V
}

interface RecordFunctionPort {
  /**
   * Create Record instance.
   */
  <T>(value: T): RecordPort<T>
}

interface CollectionPort<T> {
  /**
   * Push new item to collection.
   *
   * @param item
   */
  add(item: T): CollectionPort<T>

  /**
   * Find by index, and mutate record value in collection.
   * If no record found, do nothing.
   *
   * @param index
   * @param mutation
   */
  at(index: number, mutation: MutateRecord<T>): CollectionPort<T>

  /**
   * Find by property identifier, and mutate record value in collection.
   * If no record found, do nothing.
   *
   * @example
   * ```
   * collection.at({ id: 123 }, (record) =>
   *   record.update('prop', 'value')
   * )
   * ```
   *
   * @param condition
   * @param mutation
   */
  at(condition: Partial<T>, mutation: MutateRecord<T>): CollectionPort<T>

  /**
   * Replace to specified record by index.
   * If no record found, do nothing.
   *
   * @param index
   * @param item
   */
  replace(index: number, item: T): CollectionPort<T>

  /**
   * Replace to specified record by property identifier.
   * If no record found, do nothing.
   *
   * @example
   * ```
   * collection.replace({ id: 123 }, newItem)
   * ```
   *
   * @param cond
   * @param item
   */
  replace(condition: Partial<T>, item: T): CollectionPort<T>

  /**
   * Remove to specified record by index
   * If no record found, do nothing.
   */
  remove(index: number): CollectionPort<T>

  /**
   * Remove to specified record by property identifier.
   * If no record found, do nothing.
   *
   * @example
   * ```
   * collection.remove({ id: 123 })
   * ```
   */
  remove(condition: Partial<T>): CollectionPort<T>

  /**
   * Move an element forward or backward, by index
   *
   * @param index
   * @param direction
   */
  move(index: number, direction: 'forward' | 'backward'): CollectionPort<T>

  /**
   * Move an element forward or backward, by condition
   *
   * @example
   * ```
   * // for forward
   * collection.move({ id: 3 }, 'forward')
   * // [{id: 1}, {id: 2}, {id: 3}] -> [{id: 1}, {id: 3}, {id: 2}]
   *
   * // for backward
   * collection.move({ id: 1 }, 'backward')
   * // [{id: 1}, {id: 2}, {id: 3}] -> [{id: 2}, {id: 1}, {id: 3}]
   *
   * ```
   *
   * @param index
   * @param direction
   */
  move(
    condition: Partial<T>,
    direction: 'forward' | 'backward',
  ): CollectionPort<T>

  /**
   * Returns processed array.
   */
  done(): T[]

  /**
   * Find collection element, by index
   * If the return value is object, return a RecordPort instance.
   * If not found element, return undefined.
   *
   * @param index
   */
  find<V extends IsObject<T, RecordPort<T>, T>>(index: number): V | undefined

  /**
   * Find collection element, by condition
   * If the return value is object, return a RecordPort instance.
   * If not found element, return undefined.
   *
   * @example
   * ```
   * const element = collection.find({ id: 1 })
   * ```
   *
   * @param condition
   */
  find<V extends IsObject<T, RecordPort<T>, T>>(
    condition: Partial<T>,
  ): V | undefined

  /**
   * Get record by last item
   */
  last<V extends IsObject<T, RecordPort<T>, T>>(): V | undefined
}

type MutateCollection<T> = (collection: CollectionPort<T>) => CollectionPort<T>
type MutateRecord<T> = (record: RecordPort<T>) => RecordPort<T>
type RecordMutateFunction<T, V> = (prev: RecordPort<T>) => V

export type {
  CollectionPort,
  MutateCollection,
  MutateRecord,
  RecordFunctionPort,
  RecordPort,
  RecordMutateFunction,
}
