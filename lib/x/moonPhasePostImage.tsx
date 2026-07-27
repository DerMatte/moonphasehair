import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { moonShadowPath } from "@/lib/moonShadowPath";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 675;
const MOON_SIZE = 360;

export type MoonPhasePostImageTheme = "brand" | "dark";

type MoonPhasePostImage = {
	name: string;
	action: string;
	description: string;
	phaseValue: number;
	phaseDate: Date;
	timing: string;
	theme?: MoonPhasePostImageTheme;
};

const THEMES = {
	brand: {
		canvas: "#f5f5f5",
		foreground: "#171717",
		pattern:
			"radial-gradient(circle at 2px 2px, rgba(23, 23, 23, 0.09) 1.4px, transparent 1.5px)",
		decorTop: "rgba(163, 163, 163, 0.1)",
		decorBottom: "rgba(203, 213, 225, 0.24)",
		brand: "#404040",
		badgeBackground: "#171717",
		badgeBorder: "#171717",
		badgeText: "#fafafa",
		divider: "#d4d4d4",
		moonHalo: "#ffffff",
		moonGlow: "0 16px 42px rgba(23, 23, 23, 0.14)",
		moonShadow: "#171717",
		moonStroke: "rgba(23, 23, 23, 0.28)",
		date: "#737373",
		action: "#262626",
		description: "#525252",
	},
	dark: {
		canvas:
			"radial-gradient(circle at 18% 12%, #30305f 0%, #17172f 35%, #090913 78%)",
		foreground: "#f8fafc",
		pattern:
			"radial-gradient(circle at 2px 2px, transparent 1px, transparent 1px)",
		decorTop: "rgba(196, 181, 253, 0.11)",
		decorBottom: "rgba(125, 211, 252, 0.08)",
		brand: "#d8b4fe",
		badgeBackground: "transparent",
		badgeBorder: "rgba(216, 180, 254, 0.45)",
		badgeText: "#e9d5ff",
		divider: "rgba(216, 180, 254, 0.14)",
		moonHalo: "rgba(255, 255, 255, 0.04)",
		moonGlow: "0 0 70px rgba(196, 181, 253, 0.22)",
		moonShadow: "#090913",
		moonStroke: "rgba(255, 255, 255, 0.3)",
		date: "#a5b4fc",
		action: "#f5d0fe",
		description: "#cbd5e1",
	},
} as const;

let fontsPromise: Promise<[Buffer, Buffer]> | undefined;

const loadFonts = () => {
	fontsPromise ??= Promise.all([
		readFile(join(process.cwd(), "public/SpaceGrotesk-Bold.ttf")),
		readFile(join(process.cwd(), "public/SpaceMono-Regular.ttf")),
	]);

	return fontsPromise;
};

const formatPhaseDate = (date: Date) =>
	date.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});

export const getMoonPhasePostImageAltText = ({
	name,
	action,
	description,
	phaseDate,
}: Pick<MoonPhasePostImage, "name" | "action" | "description" | "phaseDate">) =>
	`${name} moon phase hair guide for ${formatPhaseDate(phaseDate)}. ${action}. ${description}.`;

export async function createMoonPhasePostImage({
	name,
	action,
	description,
	phaseValue,
	phaseDate,
	timing,
	theme = "brand",
}: MoonPhasePostImage) {
	const [spaceGroteskBold, spaceMonoRegular] = await loadFonts();
	const shadowPath = moonShadowPath(phaseValue, MOON_SIZE);
	const colors = THEMES[theme];

	const response = new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				position: "relative",
				overflow: "hidden",
				color: colors.foreground,
				background: colors.canvas,
				fontFamily: "Space Grotesk",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: colors.pattern,
					backgroundSize: "38px 38px",
					opacity: 0.34,
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: "620px",
					height: "620px",
					top: "-380px",
					right: "-150px",
					borderRadius: "999px",
					background: colors.decorTop,
				}}
			/>
			<div
				style={{
					position: "absolute",
					width: "440px",
					height: "440px",
					bottom: "-320px",
					left: "240px",
					borderRadius: "999px",
					background: colors.decorBottom,
				}}
			/>

			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					padding: "54px 64px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							fontSize: "24px",
							letterSpacing: "0.2em",
							color: colors.brand,
						}}
					>
						moonphasehair.com
					</div>
					<div
						style={{
							display: "flex",
							padding: "11px 20px",
							border: `1px solid ${colors.badgeBorder}`,
							borderRadius: "999px",
							background: colors.badgeBackground,
							fontFamily: "Space Mono",
							fontSize: "19px",
							color: colors.badgeText,
						}}
					>
						{timing}
					</div>
				</div>
				<div
					style={{
						display: "flex",
						width: "100%",
						height: "1px",
						marginTop: "22px",
						background: colors.divider,
					}}
				/>

				<div
					style={{
						display: "flex",
						flex: 1,
						alignItems: "center",
						gap: "72px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							width: `${MOON_SIZE + 30}px`,
							height: `${MOON_SIZE + 30}px`,
							borderRadius: "999px",
							background: colors.moonHalo,
							boxShadow: colors.moonGlow,
						}}
					>
						<svg
							width={MOON_SIZE}
							height={MOON_SIZE}
							viewBox={`0 0 ${MOON_SIZE} ${MOON_SIZE}`}
							aria-label={`${name} moon`}
						>
							<defs>
								<radialGradient id="moon-surface" cx="35%" cy="28%" r="72%">
									<stop offset="0%" stopColor="#fffdf2" />
									<stop offset="58%" stopColor="#d9d6c9" />
									<stop offset="100%" stopColor="#9b9a91" />
								</radialGradient>
								<clipPath id="moon-disc">
									<circle
										cx={MOON_SIZE / 2}
										cy={MOON_SIZE / 2}
										r={MOON_SIZE / 2 - 3}
									/>
								</clipPath>
							</defs>
							<circle
								cx={MOON_SIZE / 2}
								cy={MOON_SIZE / 2}
								r={MOON_SIZE / 2 - 3}
								fill="url(#moon-surface)"
							/>
							<g clipPath="url(#moon-disc)" opacity="0.3" fill="#85847c">
								<circle cx="104" cy="105" r="36" />
								<circle cx="248" cy="80" r="24" />
								<circle cx="257" cy="220" r="47" />
								<circle cx="126" cy="258" r="29" />
								<circle cx="188" cy="170" r="18" />
								<circle cx="56" cy="196" r="15" />
							</g>
							{shadowPath ? (
								<path d={shadowPath} fill={colors.moonShadow} opacity="0.94" />
							) : null}
							<circle
								cx={MOON_SIZE / 2}
								cy={MOON_SIZE / 2}
								r={MOON_SIZE / 2 - 3}
								fill="none"
								stroke={colors.moonStroke}
								strokeWidth="5"
							/>
						</svg>
					</div>

					<div
						style={{
							display: "flex",
							flex: 1,
							flexDirection: "column",
							alignItems: "flex-start",
						}}
					>
						<div
							style={{
								display: "flex",
								fontFamily: "Space Mono",
								fontSize: "22px",
								color: colors.date,
								marginBottom: "16px",
							}}
						>
							{formatPhaseDate(phaseDate)}
						</div>
						<div
							style={{
								display: "flex",
								fontSize: "66px",
								lineHeight: 0.98,
								letterSpacing: "-0.045em",
								marginBottom: "26px",
							}}
						>
							{name}
						</div>
						<div
							style={{
								display: "flex",
								fontSize: "30px",
								lineHeight: 1.15,
								color: colors.action,
								marginBottom: "20px",
							}}
						>
							{action}
						</div>
						<div
							style={{
								display: "flex",
								fontFamily: "Space Mono",
								fontSize: "21px",
								lineHeight: 1.4,
								color: colors.description,
								maxWidth: "560px",
							}}
						>
							{description}
						</div>
					</div>
				</div>
			</div>
		</div>,
		{
			width: IMAGE_WIDTH,
			height: IMAGE_HEIGHT,
			fonts: [
				{
					name: "Space Grotesk",
					data: spaceGroteskBold,
					style: "normal",
					weight: 700,
				},
				{
					name: "Space Mono",
					data: spaceMonoRegular,
					style: "normal",
					weight: 400,
				},
			],
		},
	);

	return Buffer.from(await response.arrayBuffer());
}
