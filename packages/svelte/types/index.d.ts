/**
 * Svelte helper to enable smart Reactive rerendering of your component.
 *
 * The usage of the return value is automatically tracked.
 * The component where you use this store is then rerendered automatically if any of the
 * used values change.
 *
 * e.g.:
 *
 * // Store setup:
 * const globalStore = SyncedStore({ people: [] });
 * globalStore.items.push({ name: "Alice" });
 * globalStore.items.push({ name: "Bob" });
 *
 * // In your component:
 * const store = svelteSyncedStore(globalStore);
 * <div>{$store.items[1].name}</div>
 *
 * Now, your component only rerenders when Bob's name changes
 *  (or if the second element of the array changes)
 *
 * Binding values works also.
 * <input type="text" bind:value={$store.items[1].name} />
 */
export declare function svelteSyncedStore<T>(syncedObject: T): {
    subscribe: (this: void, run: import("svelte/store").Subscriber<T>, invalidate?: ((value?: T | undefined) => void) | undefined) => import("svelte/store").Unsubscriber;
    set: () => void;
};
