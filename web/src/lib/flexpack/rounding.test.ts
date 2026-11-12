/**
 * Rounding must be true half-up. The naive Math.round((v + EPSILON) * 100) / 100
 * gets several .xx5 values wrong; these cases pin the ones that failed in review.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { roundHalfUp, roundPaisa } from "./rounding";
import { formatInr, formatInt, formatNumber } from "./format";

test("roundPaisa is half-up on the awkward .xx5 values", () => {
  const cases: [number, number][] = [
    [2.135, 2.14],
    [9.995, 10],
    [1.005, 1.01],
    [2.675, 2.68],
    [1.115, 1.12],
    [4.015, 4.02],
    [8.345, 8.35],
    [0.285, 0.29],
    [1.255, 1.26],
    [10.075, 10.08],
    [0.005, 0.01],
    [0.004, 0],
    [2.134, 2.13],
    [2.136, 2.14],
    [5.7950836, 5.8],
    [4.4819419, 4.48],
    [213525.52, 213525.52],
    [0, 0],
  ];
  for (const [input, expected] of cases) assert.equal(roundPaisa(input), expected, `roundPaisa(${input})`);
});

test("every x.xx5 from 0.005 to 99.995 rounds up", () => {
  for (let cents = 0; cents < 10_000; cents += 1) {
    const value = Number(`${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}5`);
    assert.equal(roundPaisa(value), (cents + 1) / 100, `roundPaisa(${value})`);
  }
});

test("negatives round half away from zero, the same in the engine and on screen", () => {
  assert.equal(roundPaisa(-2.135), -2.14);
  assert.equal(roundPaisa(-1.005), -1.01);
  assert.equal(roundPaisa(-0.004), 0);
  assert.ok(Object.is(roundPaisa(-0.004), 0), "no negative zero");
  assert.equal(formatInr(-2.135), "₹-2.14");
  assert.equal(formatNumber(-2.135), "-2.14");
});

test("other decimal places, and values that cannot be rounded", () => {
  assert.equal(roundHalfUp(4270.5), 4270.5);
  assert.equal(roundHalfUp(4270.5, 0), 4271);
  assert.equal(roundHalfUp(0.0285, 3), 0.029);
  assert.equal(roundHalfUp(1e-9, 2), 0);
  assert.equal(roundHalfUp(1.5e21, 2), 1.5e21);
  assert.ok(Number.isNaN(roundHalfUp(Number.NaN)));
});

test("the formatters use the same rule", () => {
  assert.equal(formatInr(2.135), "₹2.14");
  assert.equal(formatInr(9.995), "₹10.00");
  assert.equal(formatInr(213525.52, 0), "₹2,13,526");
  assert.equal(formatNumber(105.435), "105.44");
  assert.equal(formatInt(4270.5), "4,271");
});
