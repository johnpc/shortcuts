import type { ShortcutDefinition } from '../types/shortcut';
import { cameraActions } from './action-button/camera';
import { scriptActions } from './action-button/scripts';
import { lightsSubmenu } from './action-button/lights';

interface Script {
  name: string;
  id: string;
}

async function fetchScripts(): Promise<Script[]> {
  const response = await fetch(process.env.HOME_ASSISTANT_API_URL!);
  const data = await response.json();
  return data.scripts;
}

async function buildActionButton(): Promise<ShortcutDefinition> {
  const scripts = await fetchScripts();
  const groupingId = 'action-button-menu';
  const lightsGroupingId = 'lights-submenu';

  const scriptOrder = [
    'Garage Close',
    'Garage Open',
    'Lock All Doors',
    'Unlock All Doors',
    'Heated Stairs On',
    'Heated Stairs Off',
  ];

  const orderedScripts = scriptOrder
    .map((name) => scripts.find((s) => s.name === name))
    .filter((s): s is Script => s !== undefined);

  const heatedStairsScripts = orderedScripts.filter((s) => s.name.startsWith('Heated Stairs'));
  const mainScripts = orderedScripts.filter((s) => !s.name.startsWith('Heated Stairs'));

  const menuItems = [
    'Camera',
    ...mainScripts.map((s) => s.name),
    'Lights',
    ...heatedStairsScripts.map((s) => s.name),
  ];

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
    // Camera
    ...cameraActions(groupingId),
    // Main scripts (Garage, Lock/Unlock)
    ...scriptActions(mainScripts, groupingId),
    // Lights submenu
    ...lightsSubmenu(groupingId, lightsGroupingId),
    // Heated Stairs
    ...scriptActions(heatedStairsScripts, groupingId),
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
