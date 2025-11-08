const VARIABLE_PATTERN = /{{\s*([a-zA-Z0-9_\.]+)\s*}}/g;

export const extractVariables = (template: string): string[] => {
  const variables = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = VARIABLE_PATTERN.exec(template)) !== null) {
    variables.add(match[1]);
  }
  return Array.from(variables);
};

export type TemplateValue = string | number | boolean | undefined | null | TemplateContext;

export interface TemplateContext {
  [key: string]: TemplateValue;
}

const resolveValue = (context: TemplateContext, path: string): string => {
  const segments = path.split('.');
  let current: TemplateValue = context;
  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return '';
    }
    current = (current as TemplateContext)[segment];
  }
  if (current === null || current === undefined) {
    return '';
  }
  return String(current);
};

export const renderTemplate = (template: string, context: TemplateContext): string =>
  template.replace(VARIABLE_PATTERN, (_, variable) => resolveValue(context, variable));
