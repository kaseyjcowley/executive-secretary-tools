declare module "daisyui" {
  import type { Config } from "tailwindcss";
  type PluginCreator = (helpers: {
    addUtilities: unknown;
    addComponents: unknown;
    addBase: unknown;
    config: unknown;
    e: unknown;
    theme: unknown;
  }) => void;
  const daisyui: (options?: Record<string, unknown>) => {
    handler: PluginCreator;
    config?: Partial<Config>;
  };
  export default daisyui;
}
