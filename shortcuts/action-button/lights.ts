import { httpPostAction, menuCase } from './helpers';
import type { LightTheme, ShortcutAction } from './types';
import { CONFIG } from './config';

interface LightScript {
  name: string;
  scriptId: string;
}

const LIGHT_THEMES: readonly LightTheme[] = [
  { name: 'Lights: Off', action: 'all_off' },
  { name: 'Lights: Warm White', action: 'all_bright' },
  { name: 'Lights: Max Brightness', action: 'set_brightness', brightness: 100 },
  { name: 'Lights: Dim', action: 'set_brightness', brightness: 30 },
  { name: 'Lights: Very Dim', action: 'set_brightness', brightness: 1 },
  { name: 'Lights: Blue', action: 'all_blue' },
  { name: 'Lights: Red', action: 'all_red' },
  { name: 'Lights: Random', action: 'all_random' },
] as const;

const LIGHT_SCRIPTS: readonly LightScript[] = [
  { name: 'Govee Lights Off', scriptId: 'govee_lights_off' },
  { name: 'Movie Mode', scriptId: 'movie_mode' },
] as const;

export function lightsSubmenu(mainGroupingId: string, lightsGroupingId: string): ShortcutAction[] {
  const allLightItems = [...LIGHT_THEMES.map((t) => t.name), ...LIGHT_SCRIPTS.map((s) => s.name)];

  return [
    // Open lights submenu
    menuCase('Lights', mainGroupingId),
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuPrompt: 'Lights',
        WFControlFlowMode: 0,
        WFMenuItems: allLightItems,
        GroupingIdentifier: lightsGroupingId,
      },
    },
    // Light theme cases (API actions)
    ...LIGHT_THEMES.flatMap((theme) => {
      const body: Record<string, string | number> = { action: theme.action };
      if (theme.brightness !== undefined) {
        body.brightness = theme.brightness;
      }
      return [menuCase(theme.name, lightsGroupingId), httpPostAction(CONFIG.LIGHTS_API_URL, body)];
    }),
    // Light script cases (Home Assistant scripts)
    ...LIGHT_SCRIPTS.flatMap((script) => [
      menuCase(script.name, lightsGroupingId),
      httpPostAction(process.env.HOME_ASSISTANT_API_URL!, { script: script.scriptId }),
    ]),
    // Close lights submenu
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        GroupingIdentifier: lightsGroupingId,
        WFControlFlowMode: 2,
      },
    },
  ];
}
