import type { ShortcutDefinition } from '../types/shortcut';

interface Script {
  name: string;
  id: string;
}

const scripts: Script[] = [
  { name: 'Heated Stairs On', id: 'heated_stairs_on' },
  { name: 'Heated Stairs Off', id: 'heated_stairs_off' },
  { name: 'Garage Open', id: 'garage_open' },
  { name: 'Garage Close', id: 'garage_close' },
  { name: 'Lock All Doors', id: 'lock_all_doors' },
  { name: 'Unlock All Doors', id: 'unlock_all_doors' },
  { name: 'Movie Mode', id: 'movie_mode' },
  { name: 'Govee Lights Off', id: 'govee_lights_off' },
];

const groupingId = 'action-button-menu';
const menuItems = ['Camera', ...scripts.map((s) => s.name)];

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
  // Menu end
  {
    WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
    WFWorkflowActionParameters: {
      GroupingIdentifier: groupingId,
      WFControlFlowMode: 2,
    },
  },
];

export const actionButton: ShortcutDefinition = {
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
