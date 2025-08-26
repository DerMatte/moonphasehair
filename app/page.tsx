import MoonHairDashboardClient from './MoonHairDashboardClient';

export const revalidate = 3600; // 1 hour (60 * 60)

export default function MoonHairDashboard() {
	return <MoonHairDashboardClient />;
}
