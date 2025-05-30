import { useEffect, useState } from "react";
import { StorageService } from "../services/storage-service.js";
import { MakePartialIfPlainObject } from "../utils/index.js";

/**
 * Generic hook to bind chrome.storage.local to React state
 */
export function useStorage<T>(
  service: StorageService<T>
): [T | undefined, (newValue: T) => Promise<void>] {
  const [value, setValue] = useState<T | undefined>(undefined);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    // Initial fetch
    service.value().then(setValue);

    // Listen for external changes
    unlisten = service.addChangeListener((newVal) => {
      setValue(newVal);
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [service]);

  const update = async (newValue: T) => {
    await service.set(newValue as MakePartialIfPlainObject<T>);
    setValue(newValue); // optional, will also update via listener
  };

  return [value, update];
}
