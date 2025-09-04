import { getAllUserSubscriptions } from "@/app/actions/moon-subscription";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default async function UserSubscriptions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const subscribedPhases = await getAllUserSubscriptions();

  if (subscribedPhases.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Your Moon Phase Notifications
        </CardTitle>
        <CardDescription>
          You'll be notified when these phases occur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subscribedPhases.map((phase) => (
            <div key={phase} className="flex items-center gap-2 p-2 bg-neutral-50 rounded">
              <span className="text-green-600">✓</span>
              <span className="font-mono">{phase}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Click on any moon phase card below to manage your subscriptions
        </p>
      </CardContent>
    </Card>
  );
}