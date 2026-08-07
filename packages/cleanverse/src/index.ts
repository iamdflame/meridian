export * from "./types.js";
export * from "./crypto.js";
export { SkillsClient, type SkillsConfig } from "./skills.js";
export { CooperateClient, type CooperateConfig } from "./cooperate.js";
export { FixtureStore } from "./fixtures.js";

import { CooperateClient } from "./cooperate.js";
import { SkillsClient } from "./skills.js";

/** Build both clients from environment (matches .env.example). */
export function fromEnv(env: NodeJS.ProcessEnv = process.env): {
  skills: SkillsClient;
  cooperate: CooperateClient;
} {
  return {
    skills: new SkillsClient({
      base: env.CLEANVERSE_SKILLS_BASE ?? "https://uatapi.cleanverse.com/api/skills",
    }),
    cooperate: new CooperateClient({
      base: env.CLEANVERSE_COOPERATE_BASE ?? "https://uatapi.cleanverse.com/api/cooperate",
      ...(env.CLEANVERSE_API_ID ? { apiId: env.CLEANVERSE_API_ID } : {}),
      ...(env.CLEANVERSE_APP_KEY ? { appKey: env.CLEANVERSE_APP_KEY } : {}),
      allowFixtures: env.MERIDIAN_ALLOW_FIXTURES !== "0",
    }),
  };
}
