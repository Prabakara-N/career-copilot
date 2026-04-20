import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface LocationsTabProps {
  data: CompanyResearch;
}

export function LocationsTab({ data }: LocationsTabProps) {
  const { locations } = data;
  if (!locations.hq && locations.offices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No public location data.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {locations.hq && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headquarters</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="font-medium">{locations.hq.city}, {locations.hq.country}</span>
          </CardContent>
        </Card>
      )}

      {locations.offices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offices ({locations.offices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {locations.offices.map((office, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span>{office.city}, {office.country}</span>
                  </div>
                  {office.isHq && <Badge variant="outline" className="text-[10px]">HQ</Badge>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
