import Browser from "webextension-polyfill";

export const storageAPI = Browser.storage.local;

export class StorageService<Value> {
  private readonly __key: string;
  private readonly __defaultValue: Value | undefined;
  private __changeListener: ((newValue: Value, oldValue: Value) => void)[] = [];

  constructor(key: string, defaultValue?: Value) {
    this.__key = key;
    this.__defaultValue = defaultValue;
    this.__initChangeListener();
  }

  __initChangeListener = () => {
    storageAPI.onChanged.addListener((changes) => {
      if (changes[this.__key]) {
        this.__changeListener.forEach((listener) => {
          listener(changes[this.__key].newValue, changes[this.__key].oldValue);
        });
      }
    });
  };

  get = () => this.__key;

  value = async () => {
    const data = await storageAPI.get(this.__key);
    return (data[this.__key] as Value | undefined) ?? this.__defaultValue;
  };

  remove = async () => await storageAPI.remove(this.__key);

  static clear = async () => await storageAPI.clear();
}
