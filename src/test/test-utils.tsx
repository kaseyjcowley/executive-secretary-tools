import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
  root: null,
  rootMargin: "",
  thresholds: [],
})) as unknown as typeof IntersectionObserver;

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: mockIntersectionObserver,
});

window.scrollTo = vi.fn();

const mockMatchMedia = vi.fn((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

const customRender = (
  ui: ReactElement<unknown>,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { ...options });
};

export * from "@testing-library/react";
export { customRender as render };
