import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import animeRouter from "./anime";
import episodesRouter from "./episodes";
import usersRouter from "./users";
import solveLinksRouter from "./solve_links";
import analyticsRouter from "./analytics";
import watchlistRouter from "./watchlist";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(animeRouter);
router.use(episodesRouter);
router.use(usersRouter);
router.use(solveLinksRouter);
router.use(analyticsRouter);
router.use(watchlistRouter);

export default router;
