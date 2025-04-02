(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte/store'), require('@reactivedata/reactive')) :
  typeof define === 'function' && define.amd ? define(['exports', 'svelte/store', '@reactivedata/reactive'], factory) :
  (global = global || self, factory(global.svelte = {}, global.store, global.reactive));
})(this, (function (exports, store, reactive) {
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
  function svelteSyncedStore(syncedObject) {
    var set;
    var observer = new reactive.Observer(function () {
      if (set) {
        set(store$1);
      }
    });
    var store$1 = reactive.reactive(syncedObject, observer);
    var readableStore = store.readable(store$1, function (newSet) {
      set = newSet;
      return function () {
        set = undefined;
      };
    });
    return {
      subscribe: readableStore.subscribe,
      set: function set() {}
    };
  }

  exports.svelteSyncedStore = svelteSyncedStore;

}));
//# sourceMappingURL=syncedstore-svelte.umd.js.map
