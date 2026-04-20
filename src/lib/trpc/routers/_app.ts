import { router } from "../trpc";
import { evaluationRouter } from "./evaluation";
import { trackerRouter } from "./tracker";
import { userRouter } from "./user";

export const appRouter = router({
  evaluation: evaluationRouter,
  tracker: trackerRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
