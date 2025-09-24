export type DeepPartial<T> =
  T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T extends Map<infer K, infer V>
        ? Map<DeepPartial<K>, DeepPartial<V>>
        : T extends Set<infer U>
          ? Set<DeepPartial<U>>
          : T extends object
            ? { [P in keyof T]?: DeepPartial<T[P]> }
            : T;
