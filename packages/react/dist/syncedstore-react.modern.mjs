import * as reactive from '@reactivedata/react';
import * as syncedstore from '@syncedstore/core';

/**
 * React hook to enable smart Reactive rerendering of your functional component.
 *
 * The usage of the return value is automatically tracked.
 * The component where you use this hook is then rerendered automatically if any of the
 * used values change.
 *
 * e.g.:
 *
 * // Store setup:
 * const globalStore = SyncedStore({ people: [] });
 * globalStore.people.push({ name: "Alice" });
 * globalStore.people.push({ name: "Bob" });
 *
 * // In your component:
 * const store = useSyncedStore(globalStore);
 * <div>{store.people[1].name}</div>
 *
 * Now, your component only rerenders when Bob's name changes
 *  (or if the second element of the array changes)
 */
function useSyncedStore(syncedObject, deps) {
  if (!syncedstore.getYjsValue(syncedObject)) {
    throw new Error("syncedObject passed to useSyncedStore is not a SyncedStore Store or internal data type.");
  }
  // useSyncedStore is just a wrapper for useReactive
  return reactive.useReactive(syncedObject, deps);
}
function useSyncedStores(syncedObjects, deps) {
  return reactive.useReactives(syncedObjects, deps);
}

export { useSyncedStore, useSyncedStores };
//# sourceMappingURL=syncedstore-react.modern.mjs.map
