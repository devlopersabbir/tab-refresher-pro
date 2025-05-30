export type MakePartialIfPlainObject<T> = T extends typeof Function | unknown[]
  ? T
  : T extends object
  ? Partial<T>
  : T;
