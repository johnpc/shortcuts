import { httpPostAction, menuCase } from './helpers';

interface Script {
  name: string;
  id: string;
}

export function scriptActions(scripts: Script[], groupingId: string) {
  return scripts.flatMap((script) => [
    menuCase(script.name, groupingId),
    httpPostAction(process.env.HOME_ASSISTANT_API_URL!, { script: script.id }),
  ]);
}
