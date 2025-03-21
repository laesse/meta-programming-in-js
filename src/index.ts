type SchemaField<T> =
  | {
      type: "string";
      isNullable: boolean;
      isOptional: boolean;
    }
  | {
      type: "number";
      isNullable: boolean;
      isOptional: boolean;
    }
  | {
      type: "object";
      fields: T;
      isNullable: boolean;
      isOptional: boolean;
    };

type SchemaType = "object";
type Schema<T> = {
  type: SchemaType;
  fields: T;
  isNullable: boolean;
  isOptional: boolean;
};

const object = <T extends Record<string, SchemaField<any>>>(fields: T) => {
  return {
    type: "object",
    fields,
    isOptional: false,
    optional() {
      return { ...this, isOptional: true } as const;
    },
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
    isOptional: false,
    optional() {
      return { ...this, isOptional: true } as const;
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
    isOptional: false,
    optional() {
      return { ...this, isOptional: true } as const;
    },
  } as const;
};

type Nullability<T extends SchemaField<any>> = T extends {
  isNullable: true;
}
  ? null
  : never;

type Optionality<T extends SchemaField<any>> = T extends {
  isOptional: true;
}
  ? undefined
  : never;

type RequiredFields<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];
type OptionalFields<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];

type Ident<T> = T;
type Flatten<T extends object> = Ident<{ [k in keyof T]: T[k] }>;

type AddOptionalFields<T extends object> = {
  [k in RequiredFields<T>]: T[k];
} & {
  [k in OptionalFields<T>]?: T[k];
};

// prettier-ignore
type InferField<T extends SchemaField<any>> =
    T extends { type: "string" } ? (Nullability<T> | Optionality<T> | string)
  : T extends { type: "number" } ? (Nullability<T> | Optionality<T> | number)
  : T extends { type: "object", fields: any, isNullable: boolean, isOptional: boolean } ? (Nullability<T> | Optionality<T> | Infer<T>)
  : never;

type Infer<T extends Schema<any>> =
  | Nullability<T>
  | Optionality<T>
  | Flatten<
      AddOptionalFields<{
        [key in keyof T["fields"]]: InferField<T["fields"][key]>;
      }>
    >;

const getValidators = <T extends Record<string, SchemaField<any>>>(
  schema: Schema<T>,
) => {
  const validateField = <TT extends Record<string, SchemaField<any>>>(
    fieldSchema: SchemaField<TT>,
    value: unknown,
  ): value is InferField<typeof fieldSchema> => {
    return value === null
      ? fieldSchema.isNullable
      : value === undefined
        ? fieldSchema.isOptional
        : (() => {
            switch (fieldSchema.type) {
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
                  Object.entries(fieldSchema.fields).every(
                    ([key, subFieldSchema]) =>
                      !(key in value)
                        ? subFieldSchema.isOptional
                        : // @ts-expect-error dumb
                          validateField(subFieldSchema, value[key]),
                  )
                );
              }
              default:
                throw new Error("unreachable" + value);
            }
          })();
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
    let retVal = `${valueName} === null ? ${fieldSchema.isNullable} : (
            ${valueName} === undefined ? ${fieldSchema.isOptional} : ( 
`;
    switch (fieldSchema?.type) {
      case "string": {
        retVal += `typeof ${valueName} === "string"\n`;
        break;
      }
      case "number": {
        retVal += `typeof ${valueName} === "number"\n`;
        break;
      }
      case "object": {
        retVal +=
          `
        typeof ${valueName} === "object" && \n` +
          Object.entries(fieldSchema.fields)
            .map(
              ([key, subSchema]) =>
                `(!("${key}" in ${valueName}) ? ${subSchema.isOptional} : (${getValidationStatementString(subSchema, `(${valueName})["${key}"]`)}))`,
            )
            .join(" &&\n");
        break;
      }
      default:
        throw new Error("unreachable");
    }
    return retVal + "))";
  };
  const genCode = "return " + getValidationStatementString(schema) + ";";

  // @ts-expect-error new Function does not have the correct type
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
