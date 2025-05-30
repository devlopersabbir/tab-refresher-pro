export type RequestType<T = unknown> = {
  type: string;
  payload: T;
};

export * from "./tab";
export * from "./message";
