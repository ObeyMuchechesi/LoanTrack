// Hosted preview links carry a `sharecode` query parameter. React Router
// navigations replace the query string, and a hard refresh on such a URL is
// rejected by the hosting proxy ("incomplete link"). Capture it once at boot
// and keep reapplying it to every navigation and API request.
const KEY = 'loantrack.sharecode';

function read() {
  if (typeof window === 'undefined') return '';
  const fromUrl = new URLSearchParams(window.location.search).get('sharecode');
  if (fromUrl) {
    try { sessionStorage.setItem(KEY, fromUrl); } catch { /* storage blocked */ }
    return fromUrl;
  }
  try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
}

let code = read();

export const getShareCode = () => code;
export const refreshShareCode = () => { code = read(); return code; };
export const shareQuery = () => (code ? `?sharecode=${encodeURIComponent(code)}` : '');
export const withShare = (path) => `${path}${shareQuery()}`;
