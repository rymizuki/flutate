import clone from 'just-clone'
import get from 'just-safe-get'
import set from 'just-safe-set'

import { Collection } from './collection'
import {
  CastoffArray,
  CollectionPort,
  Flatten,
  IsArray,
  MutateCollection,
  RecordMutateFunction,
  RecordPort,
} from './types'

class FlutateRecord<R> implements RecordPort<R> {
  constructor(private record: R) {}

  clone() {
    return new FlutateRecord<R>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      clone<any>(this.record),
    )
  }

  update<
    F extends Flatten<R>,
    N extends keyof F,
    V extends
      | F[N]
      | IsArray<
          F[N],
          MutateCollection<CastoffArray<F[N]>>,
          RecordMutateFunction<R, F[N]>
        > =
      | F[N]
      | IsArray<
          F[N],
          MutateCollection<CastoffArray<F[N]>>,
          RecordMutateFunction<R, F[N]>
        >,
  >(name: N, input: V) {
    const path = name.toString()
    const prev = get(this.record as object, path)
    const value = (() => {
      if (typeof input === 'function') {
        if (Array.isArray(prev)) {
          return input(this.createCollection(prev)).done()
        }
        return input(this)
      }
      return input
    })()

    set(this.record as object, path, value)
    return this
  }

  done() {
    return this.record
  }

  get<
    F extends Flatten<R>,
    N extends keyof F,
    V extends IsArray<F[N], CollectionPort<CastoffArray<F[N]>>, F[N]> = IsArray<
      F[N],
      CollectionPort<CastoffArray<F[N]>>,
      F[N]
    >,
  >(path: N): V {
    const value = get(this.record as object, path.toString())
    return Array.isArray(value) ? this.createCollection(value) : value
  }

  private createCollection<T>(rows: T[]) {
    return new Collection<T>(rows, (record) => new FlutateRecord(record))
  }
}

export { FlutateRecord }
