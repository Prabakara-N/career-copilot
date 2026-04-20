"use client";

import type { CompanyResearch } from "@/lib/schemas/company-research";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "./overview-tab";
import { PeopleTab } from "./people-tab";
import { LocationsTab } from "./locations-tab";
import { ReviewsTab } from "./reviews-tab";

interface ResearchTabsProps {
  data: CompanyResearch;
}

export function ResearchTabs({ data }: ResearchTabsProps) {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
        <TabsTrigger value="locations">Locations</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <OverviewTab data={data} />
      </TabsContent>
      <TabsContent value="people" className="mt-4">
        <PeopleTab data={data} />
      </TabsContent>
      <TabsContent value="locations" className="mt-4">
        <LocationsTab data={data} />
      </TabsContent>
      <TabsContent value="reviews" className="mt-4">
        <ReviewsTab data={data} />
      </TabsContent>
    </Tabs>
  );
}
