import fs from "fs";
import path from "path";
import { interpolate } from "rambdax";

/**
 * Loads a template file from the filesystem.
 * @param templateName - Name of the template file (without .txt extension)
 * @returns Template content as a UTF-8 string
 * @throws Error if template file cannot be read
 */
export function loadTemplate(templateName: string): string {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/templates/messages/",
      `${templateName}.txt`
    );

    const content = fs.readFileSync(templatePath, {
      encoding: "utf-8",
    });

    return content;
  } catch (error) {
    throw new Error(
      `Failed to load template "${templateName}": ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

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
