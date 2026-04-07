import { httpPostAction, menuCase } from './helpers';
import type { ShortcutAction } from './types';
import { CONFIG } from './config';

interface TeslaAction {
  name: string;
  action: string;
}

const TESLA_ACTIONS: readonly TeslaAction[] = [
  { name: 'Precondition', action: 'climate_on' },
  { name: 'Open Trunk', action: 'trunk' },
  { name: 'Open Frunk', action: 'frunk' },
  { name: 'Sentry On', action: 'sentry_on' },
  { name: 'Sentry Off', action: 'sentry_off' },
  { name: 'Lock', action: 'lock' },
  { name: 'Unlock', action: 'unlock' },
] as const;

export function teslaSubmenu(mainGroupingId: string, teslaGroupingId: string): ShortcutAction[] {
  return [
    menuCase('Tesla', mainGroupingId),
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuPrompt: 'Tesla',
        WFControlFlowMode: 0,
        WFMenuItems: TESLA_ACTIONS.map((a) => a.name),
        GroupingIdentifier: teslaGroupingId,
      },
    },
    ...TESLA_ACTIONS.flatMap((ta) => [
      menuCase(ta.name, teslaGroupingId),
      httpPostAction(CONFIG.TESLA_API_URL, { action: ta.action }),
    ]),
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        GroupingIdentifier: teslaGroupingId,
        WFControlFlowMode: 2,
      },
    },
  ];
}
