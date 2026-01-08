export function cameraActions(groupingId: string) {
  return [
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
  ];
}
