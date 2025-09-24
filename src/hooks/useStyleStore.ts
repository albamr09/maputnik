import { useCallback } from "react";
import { loadStyleUrl } from "../libs/urlopen";
import publicSources from "../config/styles.json";
import style from "../libs/style";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addStoredStyles,
  resetStoredStyles,
  selectStoredStyles,
  setStoredStyles,
} from "../store/slices/styleStoreSlice";
import { ExtendedStyleSpecification } from "../store/types";

const storagePrefix = "maputnik";
const stylePrefix = "style";
const storageKeys = {
  latest: [storagePrefix, "latest_style"].join(":"),
  accessToken: [storagePrefix, "access_token"].join(":"),
};

const defaultStyleUrl = publicSources[0].url;

// Calculate key that identifies the style with a version
const styleKey = (styleId: string) => {
  return [storagePrefix, stylePrefix, styleId].join(":");
};

// Return style ids of all styles stored in local storage
const loadStoredStyles = (): string[] => {
  const styles: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && isStyleKey(key)) {
      styles.push(fromKey(key));
    }
  }
  return styles;
};

const isStyleKey = (key: string): boolean => {
  const parts = key.split(":");
  return (
    parts.length === 3 && parts[0] === storagePrefix && parts[1] === stylePrefix
  );
};

// Load style id from key
const fromKey = (key: string): string => {
  if (!isStyleKey(key)) {
    throw new Error("Key is not a valid style key");
  }
  const parts = key.split(":");
  return parts[2];
};

const useStyleStore = () => {
  const dispatch = useAppDispatch();
  const storedStyles = useAppSelector(selectStoredStyles);

  // Fetch a default style via URL and return it or a fallback style via callback
  const loadDefaultStyle = useCallback(
    (cb: (style: ExtendedStyleSpecification) => void) => {
      loadStyleUrl(defaultStyleUrl, cb);
    },
    [],
  );

  // Find the last edited style
  const loadLatestStoredStyle = useCallback(
    (cb: (style: ExtendedStyleSpecification) => void) => {
      const _storedStyles = loadStoredStyles();
      if (_storedStyles.length === 0) {
        return loadDefaultStyle(cb);
      }

      const styleId = window.localStorage.getItem(storageKeys.latest);
      if (!styleId) {
        return loadDefaultStyle(cb);
      }

      const styleItem = window.localStorage.getItem(styleKey(styleId));
      if (styleItem) {
        return cb(JSON.parse(styleItem));
      }

      loadDefaultStyle(cb);
    },
    [loadDefaultStyle],
  );

  const initializeStoredStyles = useCallback(() => {
    dispatch(setStoredStyles(loadStoredStyles()));
  }, []);

  // Delete entire style history
  const purge = useCallback(() => {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) as string;
      if (key && key.startsWith(storagePrefix)) {
        window.localStorage.removeItem(key);
      }
    }
    dispatch(resetStoredStyles());
  }, []);

  // Save current style replacing previous version
  const save = useCallback(
    (mapStyle: ExtendedStyleSpecification) => {
      const validStyle = style.ensureStyleValidity(mapStyle);
      const key = styleKey(validStyle.id);

      const saveFn = () => {
        window.localStorage.setItem(key, JSON.stringify(validStyle));
        window.localStorage.setItem(storageKeys.latest, validStyle.id);

        // Update local state if this is a new style
        if (!storedStyles.includes(validStyle.id)) {
          dispatch(addStoredStyles(validStyle.id));
        }
      };

      try {
        saveFn();
      } catch (e) {
        // Handle quota exceeded error
        if (
          e instanceof DOMException &&
          (e.code === 22 || // Firefox
            e.code === 1014 || // Firefox
            e.name === "QuotaExceededError" ||
            e.name === "NS_ERROR_DOM_QUOTA_REACHED")
        ) {
          purge();
          saveFn(); // Retry after clearing
        } else {
          throw e;
        }
      }
      return validStyle;
    },
    [storedStyles],
  );

  return {
    initializeStoredStyles,
    loadLatestStoredStyle,
    save,
  };
};

export default useStyleStore;
