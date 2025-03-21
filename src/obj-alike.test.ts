import { test, expect, describe } from "bun:test";

function areObjectsAlike(
  obj: Record<string, unknown>,
  otherObj: Record<string, unknown>,
) {
  const keys = Object.keys(obj);
  const otherKeys = Object.keys(otherObj);
  return (
    keys.length === otherKeys.length &&
    keys.every((key) => otherKeys.includes(key)) &&
    otherKeys.every((key) => keys.includes(key))
  );
}

function areObjectsAlike2(obj: Record<string, unknown>) {
  const keys = Object.keys(obj);
  const fn =
    // prettier-ignore
    new Function("otherObj",`
      const otherKeys = Object.keys(otherObj);
      return otherKeys.length === ${keys.length}
          && (${keys.map((k) => `otherKeys.includes("${k}")`).join(" && ")})
          && otherKeys.every(otherKey => ${keys.map((k) => `otherKey === "${k}"`).join(" || ")});
  `) as (otherObj: Record<string, unknown>) => boolean;
  return fn;
}

describe("objectAlikeTests", () => {
  const foo = { a: 1, b: 2, c: 3 };
  const bar = { a: 4, b: 5, c: 6 };
  const bad = { a: 4, b: 5, d: 6 };

  test("areObjectsAlike", () => {
    expect(areObjectsAlike(foo, bar)).toBe(true);
    expect(areObjectsAlike(foo, bad)).toBe(false);
  });

  const isFooAlike = areObjectsAlike2(foo);
  test("isFooAlike", () => {
    expect(isFooAlike(bar)).toBe(true);
    expect(isFooAlike(bad)).toBe(false);
    console.log(isFooAlike.toString());
  });
});
