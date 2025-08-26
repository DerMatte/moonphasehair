export enum Hemisphere {
  NORTHERN = "Northern",
  SOUTHERN = "Southern",
}

/**
 * Determines hemisphere based on latitude
 * @param latitude - The latitude value (positive for Northern, negative for Southern)
 * @returns Hemisphere enum value
 */
export function getHemisphere(latitude: number | null | undefined): Hemisphere {
  if (latitude === null || latitude === undefined) {
    // Default to Northern hemisphere if latitude is unknown
    return Hemisphere.NORTHERN;
  }
  
  return latitude >= 0 ? Hemisphere.NORTHERN : Hemisphere.SOUTHERN;
}

/**
 * Adjusts moon phase display for Southern hemisphere
 * In the Southern hemisphere, the moon phases appear mirrored
 * @param phaseIndex - The phase index (0-7)
 * @param hemisphere - The hemisphere
 * @returns Adjusted phase index
 */
export function adjustPhaseForHemisphere(phaseIndex: number, hemisphere: Hemisphere): number {
  if (hemisphere === Hemisphere.SOUTHERN) {
    // Mirror the waxing/waning phases for Southern hemisphere
    const mirrorMap: Record<number, number> = {
      1: 7, // Waxing Crescent -> Waning Crescent
      2: 6, // First Quarter -> Last Quarter
      3: 5, // Waxing Gibbous -> Waning Gibbous
      5: 3, // Waning Gibbous -> Waxing Gibbous
      6: 2, // Last Quarter -> First Quarter
      7: 1, // Waning Crescent -> Waxing Crescent
      0: 0, // New Moon stays the same
      4: 4, // Full Moon stays the same
    };
    return mirrorMap[phaseIndex] ?? phaseIndex;
  }
  return phaseIndex;
}

/**
 * Gets the correct moon emoji for the hemisphere
 * In the Southern hemisphere, the illuminated part appears on the opposite side
 * @param phaseIndex - The phase index (0-7)
 * @param hemisphere - The hemisphere
 * @returns The appropriate emoji
 */
export function getMoonEmojiForHemisphere(phaseIndex: number, hemisphere: Hemisphere): string {
  const northernEmojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const southernEmojis = ["🌑", "🌘", "🌗", "🌖", "🌕", "🌔", "🌓", "🌒"];
  
  return hemisphere === Hemisphere.NORTHERN 
    ? northernEmojis[phaseIndex] 
    : southernEmojis[phaseIndex];
}