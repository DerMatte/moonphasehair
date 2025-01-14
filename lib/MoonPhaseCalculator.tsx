export function getMoonPhase(date: Date): number {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
  
    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;
  
    if (month < 3) {
      year--;
      month += 12;
    }
  
    month++;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882; // Synodic month length
    b = parseInt(jd.toString());
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;
  
    return b;
}
