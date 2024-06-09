export type CastoffArray<T, Fallback = T> = T extends Array<infer U>
  ? U
  : Fallback
