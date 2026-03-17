declare function requireContext(
  directory: string,
  useSubdirectories: boolean,
  regExp: RegExp,
): {
  keys(): string[];
  (id: string): string;
};

declare const require: {
  context: typeof requireContext;
};
