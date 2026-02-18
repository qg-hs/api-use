import { fetchExecutor } from "./fetchExecutor";
import { tauriExecutor } from "./tauriExecutor";
import { isTauri } from "../utils/platform";

export const executor = isTauri() ? tauriExecutor : fetchExecutor;
