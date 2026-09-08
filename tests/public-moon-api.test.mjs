import assert from "node:assert/strict";
import test from "node:test";
import {
	illuminationFromAgePercent,
	parseMoonDate,
	parseMoonPhaseName,
	phaseSlug,
} from "../lib/public-moon-parse.ts";
import { isPublicPath } from "../lib/security/public-paths.ts";

test("parseMoonDate accepts empty, ISO, calendar, and unix values", () => {
	assert.equal(parseMoonDate(null).ok, true);
	assert.equal(parseMoonDate("").ok, true);

	const calendar = parseMoonDate("2026-09-08");
	assert.equal(calendar.ok, true);
	if (calendar.ok) {
		assert.equal(calendar.date.toISOString(), "2026-09-08T00:00:00.000Z");
	}

	const iso = parseMoonDate("2026-09-08T12:00:00.000Z");
	assert.equal(iso.ok, true);
	if (iso.ok) {
		assert.equal(iso.date.toISOString(), "2026-09-08T12:00:00.000Z");
	}

	const seconds = parseMoonDate("1788854400");
	assert.equal(seconds.ok, true);

	assert.equal(parseMoonDate("not-a-date").ok, false);
	assert.equal(parseMoonDate("2026-13-40").ok, false);
});

test("parseMoonPhaseName accepts official names and slugs", () => {
	assert.deepEqual(parseMoonPhaseName("Full Moon"), {
		ok: true,
		name: "Full Moon",
	});
	assert.deepEqual(parseMoonPhaseName("full-moon"), {
		ok: true,
		name: "Full Moon",
	});
	assert.deepEqual(parseMoonPhaseName("full"), {
		ok: true,
		name: "Full Moon",
	});
	assert.equal(parseMoonPhaseName("blue").ok, false);
	assert.equal(parseMoonPhaseName("").ok, false);
});

test("phase slugs and illumination helpers stay stable", () => {
	assert.equal(phaseSlug("Full Moon"), "full-moon");
	assert.equal(illuminationFromAgePercent(0), 0);
	assert.ok(Math.abs(illuminationFromAgePercent(0.5) - 1) < 1e-10);
});

test("public API and MCP paths stay unauthenticated", () => {
	assert.equal(isPublicPath("/developers"), true);
	assert.equal(isPublicPath("/api/v1"), true);
	assert.equal(isPublicPath("/api/v1/moon"), true);
	assert.equal(isPublicPath("/api/mcp"), true);
	assert.equal(isPublicPath("/llms.txt"), true);
	assert.equal(isPublicPath("/profile"), false);
	assert.equal(isPublicPath("/api/subscribe"), false);
});
