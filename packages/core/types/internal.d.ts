import * as Y from "yjs";
import { Box } from "./boxed";
import { JSONValue } from "./types";
type NestedSchemaType = JSONValue | ObjectSchemaType | Box<any> | Y.AbstractType<any> | NestedSchemaType[];
export type ObjectSchemaType = {
    [key: string]: NestedSchemaType;
};
export declare const yToWrappedCache: WeakMap<Y.AbstractType<any> | Y.Doc, any>;
export declare function parseYjsReturnValue(value: any, implicitObserver?: any): any;
export declare function crdtValue<T extends NestedSchemaType>(value: T | Y.Array<any> | Y.Map<any>): T | import("./array").CRDTArray<any> | import("./object").CRDTObject<any>;
export {};
