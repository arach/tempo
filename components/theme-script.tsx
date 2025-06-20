export function ThemeScript() {
  const codeToRunOnClient = `
(function() {
  function getThemePreference() {
    const saved = localStorage.getItem('tempo-theme');
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  }

  function getResolvedTheme(theme) {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }

  function applyTheme() {
    const theme = getThemePreference();
    const resolvedTheme = getResolvedTheme(theme);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
    
    // Set a data attribute so we can detect if the script ran
    document.documentElement.setAttribute('data-theme-applied', 'true');
  }

  // Apply theme immediately
  applyTheme();

  // Listen for system theme changes when using system preference
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', function() {
    const currentTheme = getThemePreference();
    if (currentTheme === 'system') {
      applyTheme();
    }
  });
})();
`;

  // eslint-disable-next-line react/no-danger
  return <script dangerouslySetInnerHTML={{ __html: codeToRunOnClient }} />;
}