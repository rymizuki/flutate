import clone from 'just-clone'
import get from 'just-safe-get'
import set from 'just-safe-set'

import { Collection } from './collection'
import {
  CastoffArray,
  Flatten,
  IsArray,
  MutateCollection,
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
    V extends F[N] | MutateCollection<CastoffArray<F[N]>> = IsArray<
      F[N] | MutateCollection<CastoffArray<F[N]>>,
      F[N]
    >,
  >(name: N, input: V) {
    const path = name.toString()

    const prev = get(this.record as object, path)
    const value =
      typeof input === 'function' && Array.isArray(prev)
        ? input(this.createCollection(prev)).done()
        : input

    set(this.record as object, path, value)
    return this
  }

  done() {
    return this.record
  }

  private createCollection<T>(rows: T[]) {
    return new Collection<T>(rows, (record) => new FlutateRecord(record))
  }
}

export { FlutateRecord }
