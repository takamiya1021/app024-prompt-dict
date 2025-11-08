import { extractVariables, renderTemplate } from '../../lib/templateEngine';

describe('templateEngine', () => {
  it('extracts variables wrapped in double braces', () => {
    const template = 'Name: {{name}}, Appearance: {{ appearance }}';
    expect(extractVariables(template)).toEqual(['name', 'appearance']);
  });

  it('renders template with provided values', () => {
    const template = 'Name: {{name}}, Tags: {{tags}}';
    const result = renderTemplate(template, { name: 'Aoi', tags: '司書, 魔法' });
    expect(result).toBe('Name: Aoi, Tags: 司書, 魔法');
  });

  it('leaves unknown variables empty', () => {
    const template = '{{known}} {{unknown}}';
    expect(renderTemplate(template, { known: 'value' })).toBe('value ');
  });
});
