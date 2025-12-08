export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getImageUrl = (filename: string): string => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
  const extra = "/uploads/" + filename;

  // If API_BASE_URL starts with http, use it directly, otherwise append to current location
  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api$/, '') + extra;
  }

  const l = location;
  if (/^(localhost|127\.0\.0\.1|::1)$/.test(l.hostname)) {
    return API_BASE_URL.replace(/\/api$/, '') + extra;
  } else {
    const newHost = "Ontastbaar-api.tastbaar.studio";
    const base = `${l.protocol}//${newHost}`;
    return base + extra;
  }
}

export const getDocumentUrl = (filename: string): string => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
  const extra = "/uploads/" + filename;

  // If API_BASE_URL starts with http, use it directly, otherwise append to current location
  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api$/, '') + extra;
  }

  const l = location;
  if (/^(localhost|127\.0\.0\.1|::1)$/.test(l.hostname)) {
    return API_BASE_URL.replace(/\/api$/, '') + extra;
  } else {
    const newHost = "Ontastbaar-api.tastbaar.studio";
    const base = `${l.protocol}//${newHost}`;
    return base + extra;
  }
}

export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim()
}
