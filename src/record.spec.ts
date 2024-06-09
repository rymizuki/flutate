import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { Collection } from './collection'
import { FlutateRecord } from './record'
import { CollectionPort, RecordPort } from './types'

type Item = {
  stringValue: string
  objectValue: {
    value: string
  }
  arrayValue: { id: number; value: string }[]
}

describe('FlutateRecord', () => {
  let source: Item
  let output: Item
  let record: RecordPort<Item>

  beforeEach(() => {
    source = {
      stringValue: 'aaaa',
      objectValue: {
        value: 'bbbb',
      },
      arrayValue: [
        { id: 1, value: 'item_1' },
        { id: 2, value: 'item_2' },
        { id: 3, value: 'item_3' },
      ],
    }
    record = new FlutateRecord(source)
  })

  describe('.update', () => {
    describe('when specified direct property (.stringValue)', () => {
      beforeEach(() => {
        output = record.update('stringValue', 'updated').done()
      })
      it('should be new value', () => {
        expect(output.stringValue).toBe('updated')
      })
    })
    describe('when specified nested property (.objectValue.value)', () => {
      beforeEach(() => {
        output = record.update('objectValue.value', 'updated').done()
      })
      it('should be new value', () => {
        expect(output.objectValue).toStrictEqual({
          value: 'updated',
        })
      })
    })
    describe('when specified array property (.arrayValue)', () => {
      describe('and specified new value is empty array', () => {
        beforeEach(() => {
          output = record.update('arrayValue', []).done()
        })
        it('should be empty array', () => {
          expect(output.arrayValue).toStrictEqual([])
        })
      })
      describe('and specified collection mutation', () => {
        let mutation: Mock
        let mutationCollection: CollectionPort<Item['arrayValue'][number]>

        beforeEach(() => {
          mutation = vi.fn((collection) => {
            mutationCollection = collection
            collection.add({ id: 10, value: 'new value' })
            return collection
          })
          output = record.update('arrayValue', mutation).done()
        })

        it('should be call mutation', () => {
          expect(mutation).toBeCalledTimes(1)
        })
        it('should be call mutation with Collection', () => {
          expect(mutation).toBeCalledWith(mutationCollection)
        })
        it('should be modified property by collection', () => {
          expect(output.arrayValue).toStrictEqual([
            { id: 1, value: 'item_1' },
            { id: 2, value: 'item_2' },
            { id: 3, value: 'item_3' },
            { id: 10, value: 'new value' },
          ])
        })
      })
    })
  })

  describe('.clone', () => {
    describe('when update cloned record', () => {
      beforeEach(() => {
        output = record
          .update('stringValue', 'updated')
          .update('objectValue.value', 'updated')
          .done()
      })
      it("should't be modified source", () => {
        expect(source).toStrictEqual(source)
      })
      it('should be modified record', () => {
        expect(output).toStrictEqual({
          ...source,
          stringValue: 'updated',
          objectValue: {
            value: 'updated',
          },
        })
      })
    })
    describe('hen update source', () => {
      beforeEach(() => {
        source.stringValue = 'updated'
        source.objectValue.value = 'updated'
        output = record.done()
      })
      it('should be modified source', () => {
        expect(source).toStrictEqual({
          ...source,
          stringValue: 'updated',
          objectValue: {
            value: 'updated',
          },
        })
      })
      it("should't be modified record", () => {
        expect(output).toStrictEqual(source)
      })
    })
  })

  describe('.get(path)', () => {
    describe('when return value is collection', () => {
      let output: CollectionPort<Item['arrayValue'][number]>
      beforeEach(() => {
        output = record.get('arrayValue')
      })

      it('should be return Collection', () => {
        expect(output).toBeInstanceOf(Collection)
      })
    })
    describe('when return value is not collection | record', () => {
      describe('by default', () => {
        it('should be return value', () => {
          expect(record.get('objectValue.value')).toBe(source.objectValue.value)
        })
      })
      describe('by updated', () => {
        beforeEach(() => {
          record.update('objectValue.value', 'new value')
        })
        it('should be updated value', () => {
          expect(record.get('objectValue.value')).toBe('new value')
        })
      })
    })
  })
})
