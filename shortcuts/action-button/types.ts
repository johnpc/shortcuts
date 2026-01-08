export enum ScriptName {
  GarageClose = 'Garage Close',
  GarageOpen = 'Garage Open',
  LockAllDoors = 'Lock All Doors',
  UnlockAllDoors = 'Unlock All Doors',
  HeatedStairsOn = 'Heated Stairs On',
  HeatedStairsOff = 'Heated Stairs Off',
  MovieMode = 'Movie Mode',
  GoveeLightsOff = 'Govee Lights Off',
}

export interface Script {
  name: ScriptName;
  id: string;
}

export interface LightTheme {
  name: string;
  action: string;
  brightness?: number;
}

// Type-safe action builder return type
export type ShortcutAction = {
  WFWorkflowActionIdentifier: string;
  WFWorkflowActionParameters: Record<string, unknown>;
};
