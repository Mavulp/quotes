import { createRouter, createWebHistory } from "vue-router";

import afterEach from "./guards/afterEach";
import beforeEach from "./guards/beforeEach";
import beforeResolve from "./guards/beforeResolve";

import RouterMain from "./routes/router-main";
import RouterQuote from "./routes/router-quote";
import RouterUser from "./routes/router-user";

const router = createRouter({
  history: createWebHistory(),
  routes: [...RouterMain, ...RouterQuote, ...RouterUser],
});

router.beforeResolve(beforeResolve);
router.beforeEach(beforeEach);
router.afterEach(afterEach);

export default router;
