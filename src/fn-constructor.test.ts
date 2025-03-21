import { test, expect } from "bun:test";

function add1(num: number) {
  return num + 1;
}

// prettier-ignore
const add2 = new Function("num",`
  return num + 2;
`);

test("add1", () => {
  expect(add1(1)).toBe(2);
});

test("add2", () => {
  expect(add2(2)).toBe(4);
});

// ------------------------------------------------

console.log(add1.toString());
console.log(add2.toString());
