const STORAGE_KEY = 'safetag_finder_reports';

/**
 * Get all stored report tokens
 * Returns Array<{ ref: string, token: string, category?: string, description?: string, submittedAt: string }>
 */
export const getStoredFinderReports = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading stored finder reports:', err);
    return [];
  }
};

/**
 * Save a new submitted report reference and secret access token
 */
export const saveFinderReportToken = ({ ref, token, category, description }) => {
  try {
    const existing = getStoredFinderReports();
    // Prevent duplicate entries
    const filtered = existing.filter(item => item.ref !== ref);
    const updated = [
      {
        ref,
        token,
        category: category || '',
        description: description ? description.slice(0, 100) : '',
        submittedAt: new Date().toISOString(),
      },
      ...filtered,
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving finder report token:', err);
  }
};

/**
 * Get token for a specific report reference
 */
export const getFinderTokenForReport = (ref) => {
  const reports = getStoredFinderReports();
  const match = reports.find(r => r.ref === ref);
  return match?.token || null;
};
