import { describe, test, expect } from "bun:test";
import { z } from "./index.ts";

describe("tests", () => {
  test("basic", () => {
    expect(z.object({ foo: z.string(), bar: z.number() })).toEqual({
      type: "object",
      fields: {
        foo: { type: "string", isNullable: false, nullable: expect.anything() },
        bar: { type: "number", isNullable: false, nullable: expect.anything() },
      },
      isNullable: false,
      nullable: expect.anything(),
    });
  });

  test("demo", () => {
    const schema = z.object({ foo: z.string(), bar: z.number() });
    const { validate } = z.getValidators(schema);
    const res: unknown = JSON.parse('{"foo": "abc", "bar": 9}');
    expect(validate(res)).toBe(true);
    if (validate(res)) {
      expect(res.foo).toBe("abc");
      expect(res.bar).toBe(9);
    }
  });

  test("compiled demo", () => {
    const schema = z.object({ foo: z.string(), bar: z.number() });
    const { validate } = z.getValidators(schema);
    const res: unknown = JSON.parse('{"foo": "abc", "bar": 9}');
    expect(validate(res)).toBe(true);
    if (validate(res)) {
      expect(res.foo).toBe("abc");
      expect(res.bar).toBe(9);
    }
  });

  test("foo", () => {
    const validate = (value: unknown) => {
      return (
        (false || value !== null) &&
        value !== undefined &&
        typeof value === "object" &&
        Object.keys(value).length === 6 &&
        "string" in value &&
        (true || value["string"] !== null) &&
        value["string"] !== undefined &&
        typeof value["string"] === "string" &&
        "stringNullable" in value &&
        (value["stringNullable"] === null ? false : true) &&
        value["stringNullable"] !== undefined &&
        typeof value["stringNullable"] === "string" &&
        "number" in value &&
        (value["number"] === null ? true : true) &&
        value["number"] !== undefined &&
        typeof value["number"] === "number" &&
        "numberNullable" in value &&
        (value["numberNullable"] === null ? false : true) &&
        value["numberNullable"] !== undefined &&
        typeof value["numberNullable"] === "number" &&
        "obj" in value &&
        (value["obj"] === null ? true : true) &&
        value["obj"] !== undefined &&
        typeof value["obj"] === "object" &&
        Object.keys(value["obj"]).length === 1 &&
        "foo" in value["obj"] &&
        (value["obj"]["foo"] === null ? true : true) &&
        value["obj"]["foo"] !== undefined &&
        typeof value["obj"]["foo"] === "string" &&
        "objNullable" in value &&
        (value["objNullable"] === null ? false : true) &&
        value["objNullable"] !== undefined &&
        typeof value["objNullable"] === "object" &&
        Object.keys(value["objNullable"]).length === 1 &&
        "foo" in value["objNullable"] &&
        (value["objNullable"]["foo"] === null ? true : true) &&
        value["objNullable"]["foo"] !== undefined &&
        typeof value["objNullable"]["foo"] === "string"
      );
    };
    expect(
      validate({
        string: "",
        stringNullable: null,
        number: 0,
        numberNullable: 0,
        obj: { foo: "" },
        objNullable: { foo: "" },
      }),
    ).toEqual(true);
  });

  test("validators", () => {
    const schema = z.object({
      string: z.string(),
      stringNullable: z.string().nullable(),
      number: z.number(),
      numberNullable: z.number().nullable(),
      obj: z.object({ foo: z.string() }),
      objNullable: z.object({ foo: z.string() }).nullable(),
    });
    const { validate } = z.getValidatorsCompiled(schema);

    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: "", number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: "", number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: {foo: ''}})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: null, objNullable: null})).toEqual(false);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: {}, objNullable: null})).toEqual(false);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: {bar: null}, objNullable: null})).toEqual(false);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: {foo: null}, objNullable: null})).toEqual(false);
    // prettier-ignore
    expect(validate({string: '', number: 0, obj: {foo: ''}})).toEqual(false);
    // prettier-ignore
    expect(validate({number: 0, obj: {foo: ''}})).toEqual(false);
    expect(validate(null)).toEqual(false);
    expect(validate(undefined)).toEqual(false);
  });
});
