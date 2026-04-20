import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PeopleTabProps {
  data: CompanyResearch;
}

export function PeopleTab({ data }: PeopleTabProps) {
  const { people } = data;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Headcount</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-baseline gap-4">
          <div>
            <p className="text-3xl font-bold">
              {people.estimatedHeadcount ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">estimated</p>
          </div>
          <Badge variant="outline">{people.headcountBand}</Badge>
        </CardContent>
      </Card>

      {people.departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {people.departments.map((dept, idx) => (
                <li key={idx} className="flex items-baseline justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {dept.approxSize != null ? `~${dept.approxSize}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {people.openRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open roles ({people.openRoles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {people.openRoles.map((role, idx) => (
                <li key={idx} className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border px-3 py-2">
                  <span className="font-medium">{role.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {role.dept} · {role.location}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
