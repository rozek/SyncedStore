export type Atom = {
    /**
     * Invoke this method to notify mobx that your atom has been used somehow.
     * Returns true if there is currently a reactive context.
     */
    reportObserved(implicitObserver?: any): boolean;
    /**
     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
     */
    reportChanged(): void;
};
export declare function reaction(func: () => any, effect: () => any): any;
export declare function createAtom(_name: string, _onBecomeObservedHandler?: () => void, _onBecomeUnobservedHandler?: () => void): Atom;
/**
 * Enable MobX integration
 *
 * @param mobx An instance of mobx, e.g. import * as mobx from "mobx";
 */
export declare function enableMobxBindings(mobx: any): void;
/**
 * Enable Vue3 integration
 *
 * @param vue An instance of Vue or Vue reactivity, e.g. import * as Vue from "vue";
 */
export declare function enableVueBindings(vue: any): void;
export declare function enableReactiveBindings(reactive: any): void;
