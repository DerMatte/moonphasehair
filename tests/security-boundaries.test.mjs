import assert from "node:assert/strict";
import test from "node:test";
import {
	buildUserNotification,
	parseUserNotificationRequest,
} from "../lib/notifications/templates.ts";
import { getNotificationRetryDelayMs } from "../lib/reminders/retry.ts";
import { hasValidBearerToken } from "../lib/security/bearer.ts";
import { sanitizeLocalRedirect } from "../lib/security/redirect.ts";

test("bearer authorization fails closed", () => {
	assert.equal(hasValidBearerToken(null, undefined), false);
	assert.equal(hasValidBearerToken("Bearer anything", undefined), false);
	assert.equal(hasValidBearerToken("Basic expected", "expected"), false);
	assert.equal(hasValidBearerToken("Bearer wrong", "expected"), false);
	assert.equal(hasValidBearerToken("Bearer expected", "expected"), true);
});

test("login redirects remain on the application origin", () => {
	assert.equal(
		sanitizeLocalRedirect("/profile?tab=alerts#moon"),
		"/profile?tab=alerts#moon",
	);
	assert.equal(sanitizeLocalRedirect("https://example.com"), "/");
	assert.equal(sanitizeLocalRedirect("//example.com/path"), "/");
	assert.equal(sanitizeLocalRedirect("/\\example.com/path"), "/");
	assert.equal(sanitizeLocalRedirect("/profile\u0000"), "/");
	assert.equal(sanitizeLocalRedirect(undefined, "/safe"), "/safe");
});

test("user notification requests accept only known templates and bounded data", () => {
	assert.equal(
		parseUserNotificationRequest({
			template: "custom",
			endpoint: "https://push.example/subscription",
		}),
		null,
	);
	assert.equal(
		parseUserNotificationRequest({
			template: "fast-scheduled",
			endpoint: "https://push.example/subscription",
			duration: 25,
			hoursUntilStart: 2,
		}),
		null,
	);

	const request = parseUserNotificationRequest({
		template: "fast-scheduled",
		endpoint: "https://push.example/subscription",
		duration: 24,
		hoursUntilStart: 2,
	});
	assert.deepEqual(request, {
		template: "fast-scheduled",
		endpoint: "https://push.example/subscription",
		duration: 24,
		hoursUntilStart: 2,
	});
	assert.deepEqual(buildUserNotification(request, "production"), {
		title: "Full Moon Fast Scheduled",
		body: "Your 24h fast will begin in 2 hours",
		url: "/full-moon-fasting",
		tag: "fast-scheduled",
	});
});

test("test notifications are disabled in production", () => {
	const request = parseUserNotificationRequest({
		template: "test",
		endpoint: "https://push.example/subscription",
		message: "hello",
	});
	assert.ok(request);
	assert.equal(buildUserNotification(request, "production"), null);
	assert.equal(buildUserNotification(request, "development")?.body, "hello");
});

test("notification retries back off and cap at six hours", () => {
	assert.equal(getNotificationRetryDelayMs(1), 15 * 60 * 1000);
	assert.equal(getNotificationRetryDelayMs(2), 30 * 60 * 1000);
	assert.equal(getNotificationRetryDelayMs(20), 6 * 60 * 60 * 1000);
	assert.equal(getNotificationRetryDelayMs(Number.NaN), 15 * 60 * 1000);
});
