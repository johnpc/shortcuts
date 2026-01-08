import { httpPostAction, menuCase } from './helpers';

const LIGHT_THEMES = [
  { name: 'Lights: Off', action: 'all_off' },
  { name: 'Lights: Max Brightness', action: 'set_brightness', brightness: 100 },
  { name: 'Lights: Bright', action: 'all_bright' },
  { name: 'Lights: Dim', action: 'set_brightness', brightness: 30 },
  { name: 'Lights: Very Dim', action: 'set_brightness', brightness: 1 },
  { name: 'Lights: Random', action: 'all_random' },
  { name: 'Lights: Blue', action: 'all_blue' },
  { name: 'Lights: Red', action: 'all_red' },
  { name: 'Govee Lights: Off', action: 'govee_off' },
  { name: 'Movie Mode', action: 'movie_mode' },
];

export function lightsSubmenu(mainGroupingId: string, lightsGroupingId: string) {
  return [
    // Open lights submenu
    menuCase('Lights', mainGroupingId),
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuPrompt: 'Lights',
        WFControlFlowMode: 0,
        WFMenuItems: LIGHT_THEMES.map((t) => t.name),
        GroupingIdentifier: lightsGroupingId,
      },
    },
    // Light theme cases
    ...LIGHT_THEMES.flatMap((theme) => {
      const body: Record<string, string | number> = { action: theme.action };
      if (theme.brightness !== undefined) {
        body.brightness = theme.brightness;
      }
      return [
        menuCase(theme.name, lightsGroupingId),
        httpPostAction('https://homie.jpc.io/api/lights', body),
      ];
    }),
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
