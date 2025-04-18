import type * as React from "react";
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
export declare function useSyncedStore<T>(syncedObject: T, deps?: React.DependencyList): T;
export declare function useSyncedStores<T extends any[]>(syncedObjects: T, deps?: React.DependencyList): T;
