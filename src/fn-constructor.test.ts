import { test, expect, describe } from "bun:test";

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

// fun fact funcitons have a toString method that gives you the code of the function
console.log("add1():  \n\n", add1.toString());
console.log("add2():  \n\n", add2.toString());

// man kann auch "dynamischen" code übergeben
const superAdder = (toAdd: number) =>
  new Function(
    "num",
    `
  return num + ${toAdd};
`,
  );

// ist gelich wie superAdder
const superAdderNormal = (toAdd: number) => (num: number) => num + toAdd;

test("superAdder", () => {
  expect(superAdder(42)(1)).toBe(superAdderNormal(42)(1));
});
