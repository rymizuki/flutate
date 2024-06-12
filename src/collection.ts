import { CollectionPort, IsObject, MutateRecord, RecordPort } from './types'

type ConditionType<T> = number | Partial<T>

class Collection<T> implements CollectionPort<T> {
  constructor(
    private rows: T[],
    private createRecord: (record: T) => RecordPort<T>,
  ) {}

  add(item: T) {
    this.rows.push(item)
    return this
  }

  at(condition: ConditionType<T>, mutation: MutateRecord<T>) {
    const index = this.findIndex(condition)
    if (!this.isExists(index)) return this

    const item = this.rows[index]
    if (item === undefined) return this

    const next = mutation(this.createRecord(item))
    this.rows[index] = next.done()

    return this
  }

  replace(condition: ConditionType<T>, item: T) {
    const index = this.findIndex(condition)
    if (!this.isExists(index)) return this

    this.rows[index] = item

    return this
  }

  remove(condition: ConditionType<T>) {
    const index = this.findIndex(condition)
    if (!this.isExists(index)) return this

    this.rows.splice(index, 1)

    return this
  }

  move(condition: ConditionType<T>, direction: 'forward' | 'backward') {
    const index = this.findIndex(condition)
    if (!this.isExists(index)) return this

    if (direction === 'forward') {
      if (index === 0) return this
      const [item] = this.rows.splice(index, 1)
      if (!item) return this
      this.rows.splice(index - 1, 0, item)
    } else {
      if (index === this.rows.length - 1) return this
      const [item] = this.rows.splice(index, 1)
      if (!item) return this
      this.rows.splice(index + 1, 0, item)
    }

    return this
  }

  private isExists(index: number) {
    if (index < 0) return false
    if (this.rows[index] === undefined) return false
    return true
  }

  done() {
    return this.rows
  }

  find(condition: ConditionType<T>) {
    const index = this.findIndex(condition)
    const value = this.rows[index]
    if (value === undefined) return
    return typeof value === 'object' ? this.createRecord(value) : value
  }

  last<V extends IsObject<T, RecordPort<T>, T>>(): V | undefined {
    if (!this.rows.length) return
    const item = this.rows[this.rows.length - 1]
    if (item === undefined) return
    if (item === null) return
    return typeof item === 'object' ? this.createRecord(item) : (item as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  private findIndex(condition: ConditionType<T>) {
    const index =
      typeof condition === 'number'
        ? condition
        : this.rows.findIndex((row) => isMatch(row, condition))
    return index
  }
}

function isMatch<T>(item: T, condition: Partial<T>) {
  const props = Object.keys(condition) as (keyof typeof condition)[]
  if (!props.length) return false
  for (const prop of props) {
    if (item[prop] !== condition[prop]) return false
  }
  return true
}

export { Collection }
