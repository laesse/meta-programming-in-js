type SchemaField<T> =
  | {
      type: "string";
      isNullable: boolean;
    }
  | {
      type: "number";
      isNullable: boolean;
    }
  | {
      type: "object";
      fields: T;
      isNullable: boolean;
    };

type SchemaType = "object";
type Schema<T> = {
  type: SchemaType;
  fields: T;
  isNullable: boolean;
};

const object = <T extends Record<string, SchemaField<any>>>(fields: T) => {
  return {
    type: "object",
    fields,
    isNullable: false,
    nullable() {
      return { ...this, isNullable: true } as const;
    },
  } as const;
};

const string = () => {
  return {
    type: "string",
    isNullable: false,
    nullable() {
      return { ...this, isNullable: true } as const;
    },
  } as const;
};

const number = () => {
  return {
    type: "number",
    isNullable: false,
    nullable() {
      return { ...this, isNullable: true } as const;
    },
  } as const;
};

type Nullability<T extends SchemaField<any>> = T extends {
  isNullable: true;
}
  ? null
  : never;

// prettier-ignore
type InferField<T extends SchemaField<any>> =  
  T extends {type: "string" } ? (Nullability<T> | string)
  : T["type"] extends "number" ?(Nullability<T> | number)
  : T extends {type: "object", fields: any, isNullable: boolean} ? (Nullability<T> | Infer<T>)
  : never;

type Infer<T extends Schema<any>> =
  | Nullability<T>
  | {
      [key in keyof T["fields"]]: InferField<T["fields"][key]>;
    };

const getValidators = <T extends Record<string, SchemaField<any>>>(
  schema: Schema<T>,
) => {
  const keysTheSame = <TT extends Record<string, SchemaField<any>>>(
    schema: { type: "object"; fields: TT },
    obj: NonNullable<unknown>,
  ) => {
    return (
      new Set(Object.keys(obj)).symmetricDifference(
        new Set(Object.keys(schema.fields)),
      ).size === 0
    );
  };
  const validateField = <TT extends Record<string, SchemaField<any>>>(
    fieldSchema: SchemaField<TT>,
    value: unknown,
  ): value is InferField<typeof fieldSchema> => {
    if (value === null) {
      return fieldSchema.isNullable;
    }
    if (value === undefined) {
      // undefined is not supported yet ;-)
      return false;
    }
    switch (fieldSchema?.type) {
      case "string": {
        return typeof value === "string";
      }
      case "number": {
        return typeof value === "number";
      }
      case "object": {
        // console.log(fieldSchema, value);
        return (
          typeof value === "object" &&
          keysTheSame(fieldSchema, value) &&
          Object.entries(fieldSchema.fields).every(([key, subFieldSchema]) => {
            // @ts-expect-error dumb
            return key in value && validateField(subFieldSchema, value[key]);
          })
        );
      }
      default:
        throw new Error("unreachable" + value);
    }
  };

  const validate = (obj: unknown): obj is Infer<typeof schema> => {
    return validateField(schema, obj);
  };
  const parse = (obj: unknown): Infer<typeof schema> => {
    return obj as Infer<typeof schema>;
  };
  return { validate, parse };
};

const getValidatorsCompiled = <T extends Record<string, SchemaField<any>>>(
  schema: Schema<T>,
) => {
  const getValidationStatementString = <
    TT extends Record<string, SchemaField<any>>,
  >(
    fieldSchema: SchemaField<TT>,
    valueName: string = "value",
  ): string => {
    let retVal = `(${valueName} === null ? ${!fieldSchema.isNullable} : true) &&  
            ${valueName} !== undefined &&
`;
    switch (fieldSchema?.type) {
      case "string": {
        retVal += `typeof ${valueName} === "string"`;
        break;
      }
      case "number": {
        retVal += `typeof ${valueName} === "number"`;
        break;
      }
      case "object": {
        // console.log(fieldSchema, value);
        const keys = Object.keys(fieldSchema.fields);
        retVal +=
          `
        typeof ${valueName} === "object" && Object.keys(${valueName}).length === ${keys.length} && ` +
          Object.entries(fieldSchema.fields)
            .map(
              ([key, subSchema]) =>
                `"${key}" in ${valueName} && ${getValidationStatementString(subSchema, `(${valueName})["${key}"]`)}`,
            )
            .join(" &&\n");
        break;
      }
      default:
        throw new Error("unreachable");
    }
    return retVal;
  };
  const genCode = "return " + getValidationStatementString(schema) + ";";
  console.log(genCode);
  const validate: (value: unknown) => value is Infer<typeof schema> =
    new Function("value", genCode);
  const parse = (obj: unknown): Infer<typeof schema> => {
    return obj as Infer<typeof schema>;
  };
  return { validate, parse };
};

export const z = Object.freeze({
  object,
  string,
  number,
  getValidators,
  getValidatorsCompiled,
});

