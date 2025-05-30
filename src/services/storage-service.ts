import Browser from "webextension-polyfill";
import { MakePartialIfPlainObject } from "../utils/index.js";

export const storageAPI = Browser.storage.local;

export class StorageService<Value> {
  private readonly _key: string;
  private readonly _defaultValue: Value | undefined;
  private _changeListeners: ((newValue: Value, oldValue: Value) => void)[] = [];

  constructor(key: string, defaultValue?: Value) {
    this._key = key;
    defaultValue && (this._defaultValue = defaultValue);
    this._initChangeListeners();
  }
  _initChangeListeners = () => {
    storageAPI.onChanged.addListener((changes) => {
      // if changes is match with our key then get the new value and old value from it.
      if (changes[this._key]) {
        this._changeListeners.forEach((listener) => {
          const { newValue, oldValue } = changes[this._key];
          listener(
            (newValue ?? this._defaultValue!) as Value,
            oldValue as Value
          );
        });
      }
    });
  };

  get key(): string {
    return this._key;
  }

  /**
   * Storage value
   */
  value = async () => {
    const data = await storageAPI.get(this._key);
    return (data[this._key] as Value | undefined) ?? this._defaultValue;
  };

  set = async (value: MakePartialIfPlainObject<Value>) => {
    if (typeof value === "object" && !Array.isArray(value)) {
      const prevValue = await this.value();
      await storageAPI.set({
        [this._key]: { ...prevValue, ...value },
      });
    } else
      await storageAPI.set({
        [this._key]: value,
      });
  };

  addChangeListener = (
    listener: (newValue: Value, oldValue: Value) => void
  ) => {
    this._changeListeners.push(listener);
    // return a function that removes the listener
    return () => this.removeChangeListener(listener);
  };

  removeChangeListener = (
    listener: (newValue: Value, oldValue: Value) => void
  ) => {
    this._changeListeners = this._changeListeners.filter((l) => l !== listener);
  };

  remove = async () => await storageAPI.remove(this._key);
  static clear = async () => await storageAPI.clear();
}
