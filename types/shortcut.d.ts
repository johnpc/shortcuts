export interface ShortcutDefinition {
  name: string;
  filename: string;
  data: {
    WFWorkflowClientVersion: string;
    WFWorkflowClientRelease: string;
    WFWorkflowIcon: {
      WFWorkflowIconStartColor: number;
      WFWorkflowIconGlyphNumber: number;
    };
    WFWorkflowImportQuestions: unknown[];
    WFWorkflowTypes: string[];
    WFWorkflowInputContentItemClasses: string[];
    WFWorkflowActions: unknown[];
    WFWorkflowMinimumClientVersion: number;
    WFWorkflowMinimumClientVersionString: string;
  };
}
