import { ScriptName } from './types';

export const CONFIG = {
  // Menu structure order
  MAIN_SCRIPTS: [
    ScriptName.GarageClose,
    ScriptName.GarageOpen,
    ScriptName.LockAllDoors,
    ScriptName.UnlockAllDoors,
  ] as const,

  HEATED_STAIRS_SCRIPTS: [ScriptName.HeatedStairsOn, ScriptName.HeatedStairsOff] as const,

  BOTTOM_SCRIPTS: [ScriptName.GoveeLightsOff, ScriptName.MovieMode] as const,

  // API endpoints (from environment variables)
  get LIGHTS_API_URL() {
    return process.env.LIGHTS_API_URL!;
  },

  // Grouping IDs
  MAIN_MENU_ID: 'action-button-menu',
  LIGHTS_SUBMENU_ID: 'lights-submenu',
} as const;

// Validate required environment variables
const requiredEnvVars = ['LIGHTS_API_URL'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
