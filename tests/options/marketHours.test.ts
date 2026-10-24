import { test } from "node:test";
import assert from "node:assert/strict";
import {
  daysToExpiration,
  etDateString,
  etWallTimeToDate,
  expirationCutoff,
  getMarketStatus,
  isTradingDay,
  latestSessionDate,
  nextTradingDay,
} from "../../src/lib/options/marketHours";

test("converts New York wall time across daylight saving", () => {
  // EDT (UTC-4) in October, EST (UTC-5) in December.
  assert.equal(etWallTimeToDate("2026-10-23", 16, 0).toISOString(), "2026-10-23T20:00:00.000Z");
  assert.equal(etWallTimeToDate("2026-12-01", 9, 30).toISOString(), "2026-12-01T14:30:00.000Z");
});

test("market is open during the regular session only", () => {
  assert.equal(getMarketStatus(new Date("2026-10-23T14:00:00Z")).isOpen, true); // Fri 10:00 ET
  assert.equal(getMarketStatus(new Date("2026-10-23T13:00:00Z")).state, "pre"); // 9:00 ET
  assert.equal(getMarketStatus(new Date("2026-10-23T20:30:00Z")).state, "after"); // 4:30 PM ET
  const weekend = getMarketStatus(new Date("2026-10-24T16:00:00Z")); // Saturday
  assert.equal(weekend.isOpen, false);
  assert.equal(weekend.nextOpen.toISOString(), "2026-10-26T13:30:00.000Z"); // Monday 9:30 ET
});

test("holidays and early closes", () => {
  assert.equal(isTradingDay("2026-11-26"), false); // Thanksgiving
  assert.equal(isTradingDay("2026-07-03"), false); // Independence Day observed
  assert.equal(nextTradingDay("2026-11-25"), "2026-11-27");
  // Day after Thanksgiving closes at 1:00 PM ET.
  assert.equal(getMarketStatus(new Date("2026-11-27T18:30:00Z")).isOpen, false);
  assert.equal(expirationCutoff("2026-11-27").toISOString(), "2026-11-27T18:00:00.000Z");
});

test("session and expiration helpers", () => {
  assert.equal(etDateString(new Date("2026-10-24T02:00:00Z")), "2026-10-23");
  assert.equal(latestSessionDate(new Date("2026-10-24T16:00:00Z")), "2026-10-23");
  assert.equal(latestSessionDate(new Date("2026-10-26T12:00:00Z")), "2026-10-23");
  assert.equal(daysToExpiration("2026-10-30", new Date("2026-10-26T15:00:00Z")), 4);
});
