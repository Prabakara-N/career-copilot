import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const evaluationRouter = router({
  evaluate: protectedProcedure
    .input(z.object({
      jdText: z.string().min(50, "JD text is too short"),
      jdUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: load CV + profile from Firestore for ctx.userId
      // TODO: call claude.messages.create with EVALUATE_SYSTEM_PROMPT
      // TODO: validate response with EvaluationSchema
      // TODO: persist to Firestore
      return { ok: true, userId: ctx.userId, received: input.jdText.slice(0, 80) };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // TODO: list evaluations for ctx.userId
    return { items: [], userId: ctx.userId };
  }),
});
