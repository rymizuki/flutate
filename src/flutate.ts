import { FlutateRecord } from './record'
import { RecordFunctionPort } from './types'

const flutate: RecordFunctionPort = <T>(record: T) => {
  return new FlutateRecord(record)
}

export { flutate }
