# flutate

A TypeScript library, that aggregates record changes, into a single stream.

## Installation

```
npm install flutate
```

```
yarn add flutate
```

## Usage

```ts
const newState = flutate(state)
  .clone()
  .update('prop.name', 'new value')
  .update('prop.rows', (rows) => rows.add(item))
  .update('prop.rows', (rows) => rows.replace({ id: '123'}, newItem))
  .update('prop.rows', (rows) =>
    rows.at({ id: '123' }, (row) => row.update('note', 'new note value'))
  )
  .done()
```

## APIs

### Record

```ts
const record = flutate(source)
```

#### .update(path, value)

Update specified parameter.

The path can specify the hierarchy of the object by separating them with dots.


```ts
flutate({
  value1: 'example_1',
  value2: {
    value21: 'example_2_1'
  }
})
  .update('value1', 'new value')
  .update('value2.value21', 'new value')
```

For array manipulation.

```ts
flutate({
  values: [
    { id: 1, value: 'item_1'},
    { id: 2, value: 'item_2'},
  ]
})
  .update('values', (items) => items.add({id: 3, value: 'item_3'}))
```

#### .clone()

Deep copy record value, and return new instance.

```ts
const newRecord = record.clone()
```

#### .done()

Return mutated result value.

```ts
const result = record.done()
```

### Collection

For use in `record.update` method's mutation function.

```ts
record.update('array', (collection) => {
  // manipulate array by collection methods
  collection.add(...)

  return collation
})
```

For finding item by index and partial match of properties.

```ts
// by index
collection.remove(1)

// by partial match
collection.remove({ id: 1 })
```

#### .add(item)

Add item in collection the last.

```ts
collection.add({
  id: 1,
  value: 'item_1'
})
```

#### .remove(condition)

Remove item in collection.

```ts
collection.remove({ id: 1 })
```

#### .replace(condition, item)

Replace item in collection.

```ts
collection.replace({ id: 1 }, { id: 1, value: 'new value'})
```

#### .move(condition, direction)

Move item position by direction.

If you specify "forward" as the direction, the element will move forward.
If you specify "backward", the element will move backward.

```ts
collection
  .move({ id: 1 }, 'forward')
  .move({ id: 1}, 'backward')
```

#### .at(condition, recordMutation)

Mutate element value by mutate function with `FlutateRecord`.

```ts
collection.at({ id: 1 }, (record) => record.update('value', 'new value'))
```
