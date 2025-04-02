var reactive = require('@reactivedata/react');
var syncedstore = require('@syncedstore/core');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return n;
}

var reactive__namespace = /*#__PURE__*/_interopNamespace(reactive);
var syncedstore__namespace = /*#__PURE__*/_interopNamespace(syncedstore);

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
  if (!syncedstore__namespace.getYjsValue(syncedObject)) {
    throw new Error("syncedObject passed to useSyncedStore is not a SyncedStore Store or internal data type.");
  }
  // useSyncedStore is just a wrapper for useReactive
  return reactive__namespace.useReactive(syncedObject, deps);
}
function useSyncedStores(syncedObjects, deps) {
  return reactive__namespace.useReactives(syncedObjects, deps);
}

exports.useSyncedStore = useSyncedStore;
exports.useSyncedStores = useSyncedStores;
//# sourceMappingURL=syncedstore-react.js.map
