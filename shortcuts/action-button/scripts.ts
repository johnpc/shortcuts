import { httpPostAction, menuCase } from './helpers';
import type { Script, ShortcutAction } from './types';

export function scriptActions(scripts: Script[], groupingId: string): ShortcutAction[] {
  return scripts.flatMap((script) => [
    menuCase(script.name, groupingId),
    httpPostAction(process.env.HOME_ASSISTANT_API_URL!, { script: script.id }),
  ]);
}
