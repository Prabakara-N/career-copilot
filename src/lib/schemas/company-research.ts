import { z } from "zod";

export const CompanyStage = z.enum([
  "seed",
  "series-a",
  "series-b",
  "series-c",
  "growth",
  "public",
  "bootstrapped",
  "unknown",
]);
export type CompanyStage = z.infer<typeof CompanyStage>;

export const HeadcountBand = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001+",
]);
export type HeadcountBand = z.infer<typeof HeadcountBand>;

const FundingRoundSchema = z.object({
  round: z.string(),
  amountUsd: z.number().nullable(),
  date: z.string().nullable(),
});

const LeadershipSchema = z.object({
  name: z.string(),
  role: z.string(),
  bio: z.string(),
});

const NewsItemSchema = z.object({
  title: z.string(),
  date: z.string(),
  summary: z.string(),
  url: z.string().nullable(),
});

const OfficeSchema = z.object({
  city: z.string(),
  country: z.string(),
  isHq: z.boolean(),
});

const ReviewPlatformSchema = z.object({
  rating: z.number().nullable(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  url: z.string().nullable(),
});

const BlindSchema = z.object({
  sentiment: z.enum(["positive", "mixed", "negative", "unknown"]),
  topThreads: z.array(z.string()),
  url: z.string().nullable(),
});

const ComparablySchema = z.object({
  cultureScore: z.number().nullable(),
  url: z.string().nullable(),
});

export const CompanyResearchSchema = z.object({
  companySlug: z.string(),
  companyName: z.string(),
  overview: z.object({
    oneLiner: z.string(),
    whatTheyDo: z.string(),
    industry: z.string(),
    stage: CompanyStage,
    foundedYear: z.number().nullable(),
    lastFunding: FundingRoundSchema.nullable(),
    totalRaisedUsd: z.number().nullable(),
    leadership: z.array(LeadershipSchema),
    recentNews: z.array(NewsItemSchema),
  }),
  people: z.object({
    estimatedHeadcount: z.number().nullable(),
    headcountBand: HeadcountBand,
    departments: z.array(
      z.object({
        name: z.string(),
        approxSize: z.number().nullable(),
      })
    ),
    openRoles: z.array(
      z.object({
        title: z.string(),
        dept: z.string(),
        location: z.string(),
      })
    ),
  }),
  locations: z.object({
    hq: z
      .object({
        city: z.string(),
        country: z.string(),
      })
      .nullable(),
    offices: z.array(OfficeSchema),
  }),
  reviews: z.object({
    glassdoor: ReviewPlatformSchema.nullable(),
    ambitionBox: ReviewPlatformSchema.nullable(),
    blind: BlindSchema.nullable(),
    comparably: ComparablySchema.nullable(),
    summary: z.string(),
  }),
  citations: z.array(z.string()),
  fetchedAt: z.string(),
  ttlDays: z.number(),
  modelTrace: z.object({
    perplexityModel: z.string(),
    normalizerModel: z.string().nullable(),
    queries: z.object({
      overview: z.boolean(),
      headcount: z.boolean(),
      locations: z.boolean(),
      reviews: z.boolean(),
    }),
  }),
});
export type CompanyResearch = z.infer<typeof CompanyResearchSchema>;
