declare module '@joshfarrant/shortcuts-js/actions' {
  type Value = string | number | boolean | [] | Record<string, unknown>;

  export function chooseFromMenu(options: {
    prompt: string;
    items: Array<{
      label: string;
      actions: unknown[];
    }>;
  }): unknown;

  export function openApp(options: { appIdentifier: string }): unknown;

  export function URL(options: { url: string }): unknown;

  export function getContentsOfURL(options: {
    headers?: Record<string, Value>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    requestBodyType?: 'File' | 'JSON' | 'Form';
    requestBody?: Record<string, Value>;
  }): unknown;
}
