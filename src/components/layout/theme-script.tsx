/**
 * Applies the stored (or system) theme before first paint.
 *
 * This has to run as a blocking inline script in <head>: if the class landed
 * after hydration instead, every reader on the dark theme would see a white
 * flash on every navigation.
 */
const script = `
(function () {
  try {
    var stored = localStorage.getItem('skyl-theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored === 'dark' || (stored !== 'light' && system);
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {
    /* Private mode or disabled storage: fall back to the light theme. */
  }
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
