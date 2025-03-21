import { describe, test, expect } from "bun:test";
import { z } from "./index.ts";

describe("tests", () => {
  test("basic", () => {
    expect(z.object({ foo: z.string(), bar: z.number() })).toEqual({
      type: "object",
      fields: {
        foo: {
          type: "string",
          isNullable: false,
          nullable: expect.anything(),
          isOptional: false,
          optional: expect.anything(),
        },
        bar: {
          type: "number",
          isNullable: false,
          nullable: expect.anything(),
          isOptional: false,
          optional: expect.anything(),
        },
      },
      isNullable: false,
      nullable: expect.anything(),
      isOptional: false,
      optional: expect.anything(),
    });
  });

  test("demo", () => {
    const schema = z.object({
      foo: z.string(),
      bar: z.number(),
      opt: z.string().optional(),
    });
    const { validate } = z.getValidators(schema);
    const res: unknown = JSON.parse('{"foo": "abc", "bar": 9}');
    expect(validate(res)).toBe(true);
    if (validate(res)) {
      expect(res.foo).toBe("abc");
      expect(res.bar).toBe(9);
    }
  });

  test("compiled demo", () => {
    const schema = z.object({
      foo: z.string(),
      bar: z.number(),
      opt: z.string().optional(),
    });
    const { validate } = z.getValidatorsCompiled(schema);
    const res: unknown = JSON.parse('{"foo": "abc", "bar": 9}');
    expect(validate(res)).toBe(true);
    if (validate(res)) {
      expect(res.foo).toBe("abc");
      expect(res.bar).toBe(9);
      expect(res.opt).toBeUndefined();
    }
  });

  test("validators", () => {
    const schema = z.object({
      string: z.string(),
      stringNullable: z.string().nullable(),
      number: z.number(),
      numberNullable: z.number().nullable(),
      obj: z.object({ foo: z.string() }),
      objNullable: z.object({ foo: z.string() }).nullable(),
      objOpt: z.object({ foo: z.string() }).optional(),
    });
    const { validate } = z.getValidatorsCompiled(schema);
    console.log(validate.toString());

    // prettier-ignore
    expect(validate({string: '', stringNullable: "", number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: {foo: ''}})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: null, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: null, number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: "", number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: null})).toEqual(true);
    // prettier-ignore
    expect(validate({string: '', stringNullable: "", number: 0, numberNullable: 0, obj: {foo: ''}, objNullable: {foo: ''}, objOpt: {foo: ''}})).toEqual(true);
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
