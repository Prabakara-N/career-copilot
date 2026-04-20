export type PerplexityQueryResult = {
  label: "overview" | "headcount" | "locations" | "reviews";
  content: string;
  citations: string[];
  ok: boolean;
  error?: string;
};
