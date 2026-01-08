import type { ShortcutDefinition } from '../types/shortcut';
import { cameraActions } from './action-button/camera';
import { scriptActions } from './action-button/scripts';
import { lightsSubmenu } from './action-button/lights';
import { ScriptName, type Script } from './action-button/types';
import { CONFIG } from './action-button/config';

async function fetchScripts(): Promise<Script[]> {
  const response = await fetch(process.env.HOME_ASSISTANT_API_URL!);
  const data = await response.json();
  return data.scripts;
}

async function buildActionButton(): Promise<ShortcutDefinition> {
  const scripts = await fetchScripts();

  const scriptOrder: readonly ScriptName[] = [
    ...CONFIG.MAIN_SCRIPTS,
    ...CONFIG.HEATED_STAIRS_SCRIPTS,
    ...CONFIG.BOTTOM_SCRIPTS,
  ];

  const orderedScripts = scriptOrder
    .map((name) => scripts.find((s) => s.name === name))
    .filter((s): s is Script => s !== undefined);

  // Validate all expected scripts were found
  const missingScripts = scriptOrder.filter((name) => !orderedScripts.find((s) => s.name === name));
  if (missingScripts.length > 0) {
    console.warn('Warning: Missing scripts from API:', missingScripts);
  }

  const mainScripts = orderedScripts.filter((s) =>
    CONFIG.MAIN_SCRIPTS.includes(s.name as ScriptName)
  );
  const heatedStairsScripts = orderedScripts.filter((s) =>
    CONFIG.HEATED_STAIRS_SCRIPTS.includes(s.name as ScriptName)
  );

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
        GroupingIdentifier: CONFIG.MAIN_MENU_ID,
      },
    },
    // Camera
    ...cameraActions(CONFIG.MAIN_MENU_ID),
    // Main scripts (Garage, Lock/Unlock)
    ...scriptActions(mainScripts, CONFIG.MAIN_MENU_ID),
    // Lights submenu
    ...lightsSubmenu(CONFIG.MAIN_MENU_ID, CONFIG.LIGHTS_SUBMENU_ID),
    // Heated Stairs
    ...scriptActions(heatedStairsScripts, CONFIG.MAIN_MENU_ID),
    // Menu end
    {
      WFWorkflowActionIdentifier: 'is.workflow.actions.choosefrommenu',
      WFWorkflowActionParameters: {
        GroupingIdentifier: CONFIG.MAIN_MENU_ID,
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
