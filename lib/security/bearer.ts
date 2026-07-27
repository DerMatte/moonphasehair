import { timingSafeEqual } from "node:crypto";

export function hasValidBearerToken(
	authorizationHeader: string | null,
	secret: string | undefined,
): boolean {
	if (!secret || !authorizationHeader?.startsWith("Bearer ")) {
		return false;
	}

	const presentedToken = authorizationHeader.slice("Bearer ".length);
	const presented = Buffer.from(presentedToken);
	const expected = Buffer.from(secret);

	return (
		presented.length === expected.length && timingSafeEqual(presented, expected)
	);
}
