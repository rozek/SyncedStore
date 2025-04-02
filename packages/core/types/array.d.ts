import * as Y from "yjs";
import { INTERNAL_SYMBOL } from ".";
import { Box } from "./boxed";
import { ObjectSchemaType } from "./internal";
import { CRDTObject } from "./object";
export type CRDTArray<T> = {
    [INTERNAL_SYMBOL]?: Y.Array<T>;
    [n: number]: T extends Box<infer A> ? A : T extends Array<infer A> ? CRDTArray<A> : T extends ObjectSchemaType ? CRDTObject<T> : T;
} & T[];
export declare function crdtArray<T>(initializer: T[], arr?: Y.Array<T>): CRDTArray<T>;
