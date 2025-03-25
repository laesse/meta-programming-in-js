import { describe, test, expect } from "bun:test";
import { type } from "arktype";

const schema = type({
  myString: "string",
  myNullableString: "string | null",
  myNumber: "number",
  "myOptionalNumber?": "number",
  "myNullishSubObject?": {
    fluentApi: type.number.array(),
    fluentApiOptionalNum: type.number.optional(),
  },
});
type Schema = typeof schema.infer;
console.log("internal representation", schema.json);
console.log("test", schema.toString());

describe("arktype", () => {
  test("basic", () => {
    const myData: Schema = {
      myNullableString: null,
      myNumber: 1,
      myString: "hello world",
      myNullishSubObject: {
        fluentApi: [],
      },
    };
    const res = schema(myData);

    expect(res).not.toBeInstanceOf(type.errors);
    // @ts-ignore
    expect(res.myString).toBe("hello world");
  });
});
