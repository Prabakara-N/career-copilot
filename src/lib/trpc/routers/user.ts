import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    // TODO: load profile from Firestore
    return { userId: ctx.userId };
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1).optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      linkedinUrl: z.string().url().optional(),
      portfolioUrl: z.string().url().optional(),
      githubUrl: z.string().url().optional(),
      cvMarkdown: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: persist to Firestore
      return { ok: true, userId: ctx.userId, fields: Object.keys(input) };
    }),
});
