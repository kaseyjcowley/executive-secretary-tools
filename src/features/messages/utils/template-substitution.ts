import { interpolate } from "rambdax";

/**
 * Substitutes variables into a template using {{variable}} syntax.
 * @param template - Template string with {{variable}} placeholders
 * @param variables - Object containing variable values
 * @returns Template with variables substituted
 */
export function substituteTemplate(
  template: string,
  variables: Record<string, unknown>
): string {
  return interpolate(template, variables);
}
