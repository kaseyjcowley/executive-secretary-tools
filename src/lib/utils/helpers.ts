import { pipe, values, length } from "rambdax";

// Gets the size of a collection
export const size = pipe(values, length);
