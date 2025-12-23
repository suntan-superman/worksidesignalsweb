import '@testing-library/jest-dom/vitest';

// Mock window.matchMedia for responsive component testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Suppress console warnings during tests
const originalError = console.error;
console.error = (...args) => {
  // Filter out known React/Router warnings during tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('act(...)'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};
