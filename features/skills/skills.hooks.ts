import { useSyncExternalStore } from 'react';

const QUERY = '(pointer: fine)';

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

/** True for mouse/trackpad users. False during server render and on touch screens. */
export function useFinePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
