import * as Y from "yjs";
export type docElementTypeDescription = "xml" | "text" | Array<any> | object;
export type DocTypeDescription = {
    [key: string]: docElementTypeDescription;
};
export type MappedTypeDescription<T extends DocTypeDescription> = {
    readonly [P in keyof T]: T[P] extends "xml" ? Y.XmlFragment : T[P] extends "text" ? Y.Text : T[P] extends Array<any> ? T[P] : T[P] extends object ? Partial<T[P]> : never;
};
export declare function crdtDoc<T extends DocTypeDescription>(doc: Y.Doc, typeDescription: T): MappedTypeDescription<T>;
