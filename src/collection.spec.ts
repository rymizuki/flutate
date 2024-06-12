import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { Collection } from './collection'
import { FlutateRecord } from './record'
import { CollectionPort, RecordPort } from './types'

type Item = {
  id: string
  name: string
}

describe('FlutateCollection', () => {
  let collection: CollectionPort<Item>

  describe('.add', () => {
    describe('0 to 1', () => {
      beforeEach(() => {
        collection = createCollection<Item>([])
      })

      it('should be add item', () => {
        const item = { id: '1', name: 'test_1' }
        collection.add(item)
        expect(collection.done()).toStrictEqual([item])
      })
    })
    describe('1 to 2', () => {
      beforeEach(() => {
        collection = createCollection<Item>([{ id: '1', name: 'test_1' }])
      })
      it('should be add item, by last', () => {
        const item = { id: '2', name: 'test_2' }
        collection.add(item)
        expect(collection.done()).toStrictEqual([
          { id: '1', name: 'test_1' },
          item,
        ])
      })
    })
  })

  describe('.replace', () => {
    beforeEach(() => {
      collection = createCollection([
        { id: 'id_1', name: 'test_1' },
        { id: 'id_2', name: 'test_2' },
        { id: 'id_3', name: 'test_3' },
      ])
    })

    describe('when specified index', () => {
      describe('and found item', () => {
        it('should be replace new item', () => {
          const next = { id: 'id_2', name: 'test_2_new_value' }
          collection.replace(1, next)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2_new_value' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and not found item', () => {
        it("should't have been change", () => {
          const next = { id: 'id_2', name: 'test_2_new_value' }
          collection.replace(999, next)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
    describe('when specified condition', () => {
      describe('and found item', () => {
        it('should be replace new item', () => {
          const next = { id: 'id_2', name: 'test_2_new_value' }
          collection.replace({ id: 'id_2' }, next)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2_new_value' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and not found item', () => {
        it("should't have been change", () => {
          const next = { id: 'id_2', name: 'test_2_new_value' }
          collection.replace({ id: 'id_999' }, next)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
  })

  describe('.at', () => {
    beforeEach(() => {
      collection = createCollection([
        { id: 'id_1', name: 'test_1' },
        { id: 'id_2', name: 'test_2' },
        { id: 'id_3', name: 'test_3' },
      ])
    })

    describe('when specified index', () => {
      let mutation: Mock
      let record: RecordPort<Item>

      beforeEach(() => {
        mutation = vi.fn((value) => {
          record = value
          value.update('name', 'test_2_new_value')
          return value
        })
      })

      describe('and found item', () => {
        beforeEach(() => {
          collection.at(1, mutation)
        })

        it('should be call mutation once', () => {
          expect(mutation).toBeCalledTimes(1)
        })
        it('should be call mutation with record', () => {
          expect(mutation).toBeCalledWith(record)
        })
        it('should be apply mutation', () => {
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2_new_value' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and not found item', () => {
        beforeEach(() => {
          collection.at(999, mutation)
        })

        it("should't have been call mutation", () => {
          expect(mutation).toBeCalledTimes(0)
        })
        it("should't have been change", () => {
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
    describe('when specified condition', () => {
      let mutation: Mock
      let record: RecordPort<Item>

      beforeEach(() => {
        mutation = vi.fn((value) => {
          record = value
          value.update('name', 'test_2_new_value')
          return value
        })
      })

      describe('and found item', () => {
        beforeEach(() => {
          collection.at({ id: 'id_2' }, mutation)
        })

        it('should be call mutation once', () => {
          expect(mutation).toBeCalledTimes(1)
        })
        it('should be call mutation with record', () => {
          expect(mutation).toBeCalledWith(record)
        })
        it('should be apply mutation', () => {
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2_new_value' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and not found item', () => {
        beforeEach(() => {
          collection.at({ id: 'id_999' }, mutation)
        })

        it("should't have been call mutation", () => {
          expect(mutation).toBeCalledTimes(0)
        })
        it("should't have been change", () => {
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
  })

  describe('.remove', () => {
    beforeEach(() => {
      collection = createCollection([
        { id: 'id_1', name: 'test_1' },
        { id: 'id_2', name: 'test_2' },
        { id: 'id_3', name: 'test_3' },
      ])
    })

    describe('when specified index', () => {
      describe('and found item', () => {
        it('should be remove item', () => {
          collection.remove(1)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and found item', () => {
        it("should't have been change", () => {
          collection.remove(9999)
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
    describe('when specified condition', () => {
      describe('and found item', () => {
        it('should be remove item', () => {
          collection.remove({ id: 'id_2' })
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
      describe('and found item', () => {
        it("should't have been change", () => {
          collection.remove({ id: 'id_9999' })
          expect(collection.done()).toStrictEqual([
            { id: 'id_1', name: 'test_1' },
            { id: 'id_2', name: 'test_2' },
            { id: 'id_3', name: 'test_3' },
          ])
        })
      })
    })
  })

  describe('.move', () => {
    beforeEach(() => {
      collection = createCollection([
        { id: 'id_1', name: 'test_1' },
        { id: 'id_2', name: 'test_2' },
        { id: 'id_3', name: 'test_3' },
        { id: 'id_4', name: 'test_4' },
      ])
    })

    describe('when specified index', () => {
      describe('and direction=forward', () => {
        describe('and found item', () => {
          describe('when element position is not top', () => {
            it('should be move position forward once', () => {
              collection.move(2, 'forward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
          describe('when element position is top', () => {
            it('should\t have been change', () => {
              collection.move(0, 'forward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
        })
        describe('and not found item', () => {
          it("should't have been change", () => {
            collection.move(9999, 'forward')
            expect(collection.done()).toStrictEqual([
              { id: 'id_1', name: 'test_1' },
              { id: 'id_2', name: 'test_2' },
              { id: 'id_3', name: 'test_3' },
              { id: 'id_4', name: 'test_4' },
            ])
          })
        })
      })
      describe('and direction=backward', () => {
        describe('and found item', () => {
          describe('when element position is not top', () => {
            it('should be move position backward once', () => {
              collection.move(1, 'backward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
          describe('when element position is last', () => {
            it('should\t have been change', () => {
              collection.move(3, 'backward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
        })
        describe('and not found item', () => {
          it("should't have been change", () => {
            collection.move(9999, 'backward')
            expect(collection.done()).toStrictEqual([
              { id: 'id_1', name: 'test_1' },
              { id: 'id_2', name: 'test_2' },
              { id: 'id_3', name: 'test_3' },
              { id: 'id_4', name: 'test_4' },
            ])
          })
        })
      })
    })
    describe('when specified condition', () => {
      describe('and direction=forward', () => {
        describe('and found item', () => {
          describe('when element position is not top', () => {
            it('should be move position forward once', () => {
              collection.move({ id: 'id_3' }, 'forward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
          describe('when element position is top', () => {
            it('should\t have been change', () => {
              collection.move({ id: 'id_1' }, 'forward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
        })
        describe('and not found item', () => {
          it("should't have been change", () => {
            collection.move({ id: 'id_9999' }, 'forward')
            expect(collection.done()).toStrictEqual([
              { id: 'id_1', name: 'test_1' },
              { id: 'id_2', name: 'test_2' },
              { id: 'id_3', name: 'test_3' },
              { id: 'id_4', name: 'test_4' },
            ])
          })
        })
      })
      describe('and direction=backward', () => {
        describe('and found item', () => {
          describe('when element position is not top', () => {
            it('should be move position backward once', () => {
              collection.move({ id: 'id_2' }, 'backward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
          describe('when element position is last', () => {
            it('should\t have been change', () => {
              collection.move({ id: 'id_4' }, 'backward')
              expect(collection.done()).toStrictEqual([
                { id: 'id_1', name: 'test_1' },
                { id: 'id_2', name: 'test_2' },
                { id: 'id_3', name: 'test_3' },
                { id: 'id_4', name: 'test_4' },
              ])
            })
          })
        })
        describe('and not found item', () => {
          it("should't have been change", () => {
            collection.move({ id: 'id_9999' }, 'backward')
            expect(collection.done()).toStrictEqual([
              { id: 'id_1', name: 'test_1' },
              { id: 'id_2', name: 'test_2' },
              { id: 'id_3', name: 'test_3' },
              { id: 'id_4', name: 'test_4' },
            ])
          })
        })
      })
    })
  })

  describe('.find(index)', () => {
    beforeEach(() => {
      collection = createCollection([
        { id: 'id_1', name: 'test_1' },
        { id: 'id_2', name: 'test_2' },
        { id: 'id_3', name: 'test_3' },
      ])
    })

    describe('when return value is object', () => {
      describe('and found item', () => {
        let output: unknown
        beforeEach(() => {
          output = collection.find(1)
        })
        it('should be return Record instance', () => {
          expect(output).toBeInstanceOf(FlutateRecord)
        })
        it('should be expected item', () => {
          expect((output as RecordPort<Item>).done()).toStrictEqual({
            id: 'id_2',
            name: 'test_2',
          })
        })
      })
      describe('and not found item', () => {
        it('should be return undefined', () => {
          expect(collection.find(999)).toBeUndefined()
        })
      })
    })
  })

  describe('.last()', () => {
    describe('when has some items', () => {
      let output: RecordPort<Item> | undefined
      beforeEach(() => {
        collection = createCollection([
          { id: 'id_1', name: 'test_1' },
          { id: 'id_2', name: 'test_2' },
          { id: 'id_3', name: 'test_3' },
        ])
        output = collection.last()
      })

      it('should be return last Record instance', () => {
        expect(output).toBeInstanceOf(FlutateRecord)
      })
      it('should be return last item', () => {
        expect(output?.done()).toStrictEqual({ id: 'id_3', name: 'test_3' })
      })
    })
    describe('when has some items', () => {
      it('should be return undefined', () => {
        const collection = createCollection([])
        expect(collection.last()).toBeUndefined()
      })
    })
  })
})

function createCollection<T>(rows: T[]) {
  return new Collection<T>(rows, (record) => new FlutateRecord(record))
}
