import type { ShortcutDefinition } from '../types/shortcut';

interface Script {
  name: string;
  id: string;
}

async function fetchScripts(): Promise<Script[]> {
  const response = await fetch(process.env.HOME_ASSISTANT_API_URL!);
  const data = await response.json();
  return data.scripts;
}

const LIGHT_THEMES = [
  { name: 'Lights: Random', action: 'all_random' },
  { name: 'Lights: Blue', action: 'all_blue' },
  { name: 'Lights: Red', action: 'all_red' },
  { name: 'Lights: Bright', action: 'all_bright' },
  { name: 'Lights: Max Brightness', action: 'set_brightness', brightness: 100 },
  { name: 'Lights: Dim', action: 'set_brightness', brightness: 30 },
];

async function buildActionButton(): Promise<ShortcutDefinition> {
  const scripts = await fetchScripts();
  const groupingId = 'action-button-menu';
  const menuItems = ['Camera', ...scripts.map((s) => s.name), ...LIGHT_THEMES.map((t) => t.name)];

  const actions = [
    // Menu start
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuPrompt: 'Action Button',
        WFControlFlowMode: 0,
        WFMenuItems: menuItems,
        GroupingIdentifier: groupingId,
      },
    },
    // Camera case
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        WFMenuItemTitle: 'Camera',
        GroupingIdentifier: groupingId,
        WFControlFlowMode: 1,
      },
    },
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.openapp',
      WFWorkflowActionParameters: {
        WFAppIdentifier: 'com.apple.camera',
      },
    },
    // Script cases
    ...scripts.flatMap((script) => [
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
        WFWorkflowActionParameters: {
          WFMenuItemTitle: script.name,
          GroupingIdentifier: groupingId,
          WFControlFlowMode: 1,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
        WFWorkflowActionParameters: {
          WFURL: process.env.HOME_ASSISTANT_API_URL,
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
              WFDictionaryFieldValueItems: [
                {
                  WFItemType: 0,
                  WFKey: {
                    Value: {
                      string: 'script',
                      attachmentsByRange: {},
                    },
                    WFSerializationType: 'WFTextTokenString',
                  },
                  WFValue: {
                    Value: {
                      string: script.id,
                      attachmentsByRange: {},
                    },
                    WFSerializationType: 'WFTextTokenString',
                  },
                },
              ],
            },
            WFSerializationType: 'WFDictionaryFieldValue',
          },
        },
      },
    ]),
    // Light theme cases
    ...LIGHT_THEMES.flatMap((theme) => [
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
        WFWorkflowActionParameters: {
          WFMenuItemTitle: theme.name,
          GroupingIdentifier: groupingId,
          WFControlFlowMode: 1,
        },
      },
      {
        WFWorkflowActionIdentifier: 'is.workflow.actions.downloadurl',
        WFWorkflowActionParameters: {
          WFURL: 'https://homie.jpc.io/api/lights',
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
              WFDictionaryFieldValueItems: [
                {
                  WFItemType: 0,
                  WFKey: {
                    Value: {
                      string: 'action',
                      attachmentsByRange: {},
                    },
                    WFSerializationType: 'WFTextTokenString',
                  },
                  WFValue: {
                    Value: {
                      string: theme.action,
                      attachmentsByRange: {},
                    },
                    WFSerializationType: 'WFTextTokenString',
                  },
                },
                ...(theme.brightness !== undefined
                  ? [
                      {
                        WFItemType: 0,
                        WFKey: {
                          Value: {
                            string: 'brightness',
                            attachmentsByRange: {},
                          },
                          WFSerializationType: 'WFTextTokenString',
                        },
                        WFValue: {
                          Value: {
                            string: theme.brightness.toString(),
                            attachmentsByRange: {},
                          },
                          WFSerializationType: 'WFTextTokenString',
                        },
                      },
                    ]
                  : []),
              ],
            },
            WFSerializationType: 'WFDictionaryFieldValue',
          },
        },
      },
    ]),
    // Menu end
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        GroupingIdentifier: groupingId,
        WFControlFlowMode: 2,
      },
    },
  ];

  return {
    name: 'Action Button',
    filename: 'action-button',
    data: {
      WFWorkflowClientVersion: '724',
      WFWorkflowClientRelease: '2.1',
      WFWorkflowIcon: {
        WFWorkflowIconStartColor: 4274264319,
        WFWorkflowIconGlyphNumber: 59446,
      },
      WFWorkflowImportQuestions: [],
      WFWorkflowTypes: ['WatchKit', 'NCWidget'],
      WFWorkflowInputContentItemClasses: [
        'WFAppStoreAppContentItem',
        'WFArticleContentItem',
        'WFContactContentItem',
        'WFDateContentItem',
        'WFEmailAddressContentItem',
        'WFGenericFileContentItem',
        'WFImageContentItem',
        'WFiTunesProductContentItem',
        'WFLocationContentItem',
        'WFDCMapsLinkContentItem',
        'WFAVAssetContentItem',
        'WFPDFContentItem',
        'WFPhoneNumberContentItem',
        'WFRichTextContentItem',
        'WFSafariWebPageContentItem',
        'WFStringContentItem',
        'WFURLContentItem',
      ],
      WFWorkflowActions: actions,
      WFWorkflowMinimumClientVersion: 900,
      WFWorkflowMinimumClientVersionString: '900',
    },
  };
}

export { buildActionButton as actionButton };
