import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { ApplicationStatus } from "@/lib/schemas/application";

export const trackerRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    // TODO: list applications for ctx.userId
    return { items: [], userId: ctx.userId };
  }),

  updateStatus: protectedProcedure
    .input(z.object({
      applicationId: z.string(),
      status: ApplicationStatus,
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: update Firestore doc
      return { ok: true, applicationId: input.applicationId, userId: ctx.userId };
    }),
});
