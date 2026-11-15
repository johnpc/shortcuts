import type { ShortcutAction } from './types';

/**
 * "Mac mini" opens the peek app straight into the Mac mini's screen via its
 * URL scheme. The host is matched against the saved computer's name / Bonjour
 * name ("john’s Mac Mini", curly apostrophe as macOS advertises it) or address.
 */
export const PEEK_MAC_MINI_URL = 'peek://connect?host=john%E2%80%99s%20Mac%20Mini';

export function peekActions(groupingId: string): ShortcutAction[] {
  return [
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuItemTitle: 'Mac mini',
        GroupingIdentifier: groupingId,
        WFControlFlowMode: 1,
      },
    },
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.url',
      WFWorkflowActionParameters: {
        WFURLActionURL: PEEK_MAC_MINI_URL,
      },
    },
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.openurl',
      WFWorkflowActionParameters: {},
    },
  ];
}
