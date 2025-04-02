export type Primitive = bigint | boolean | null | number | string | symbol | undefined;
export type JSONValue = Primitive | JSONObject | JSONArray;
export type JSONObject = {
    [key: string]: JSONValue;
};
export type JSONArray = Array<JSONValue>;
export declare function isYType(element: any): boolean;
