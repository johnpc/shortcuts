import type { ShortcutAction } from './types';

export function httpPostAction(url: string, body: Record<string, string | number>): ShortcutAction {
  return {
    WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
    WFWorkflowActionParameters: {
      WFURL: url,
      Advanced: true,
      ShowHeaders: true,
      WFHTTPMethod: 'POST',
      WFHTTPBodyType: 'JSON',
      WFHTTPHeaders: {
        Value: {
          WFDictionaryFieldValueItems: [
            {
              WFItemType: 0,
              WFKey: {
                Value: {
                  string: 'Content-Type',
                  attachmentsByRange: {},
                },
                WFSerializationType: 'WFTextTokenString',
              },
              WFValue: {
                Value: {
                  string: 'application/json',
                  attachmentsByRange: {},
                },
                WFSerializationType: 'WFTextTokenString',
              },
            },
          ],
        },
        WFSerializationType: 'WFDictionaryFieldValue',
      },
      WFJSONValues: {
        Value: {
          WFDictionaryFieldValueItems: Object.entries(body).map(([key, value]) => ({
            WFItemType: 0,
            WFKey: {
              Value: {
                string: key,
                attachmentsByRange: {},
              },
              WFSerializationType: 'WFTextTokenString',
            },
            WFValue: {
              Value: {
                string: value.toString(),
                attachmentsByRange: {},
              },
              WFSerializationType: 'WFTextTokenString',
            },
          })),
        },
        WFSerializationType: 'WFDictionaryFieldValue',
      },
    },
  };
}

export function menuCase(title: string, groupingId: string): ShortcutAction {
  return {
    WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
    WFWorkflowActionParameters: {
      WFMenuItemTitle: title,
      GroupingIdentifier: groupingId,
      WFControlFlowMode: 1,
    },
  };
}
