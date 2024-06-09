import { CollectionPort, MutateRecord, RecordPort } from './types'

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

    const next = mutation(this.createRecord(this.rows[index]))
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
      this.rows.splice(index - 1, 0, item)
    } else {
      if (index === this.rows.length - 1) return this
      const [item] = this.rows.splice(index, 1)
      this.rows.splice(index + 1, 0, item)
    }

    return this
  }

  private isExists(index: number) {
    if (index < 0) return false
    if (this.rows[index] === undefined) return false
    return true
  }

  private findIndex(condition: ConditionType<T>) {
    const index =
      typeof condition === 'number'
        ? condition
        : this.rows.findIndex((row) => isMatch(row, condition))
    return index
  }

  done() {
    return this.rows
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
