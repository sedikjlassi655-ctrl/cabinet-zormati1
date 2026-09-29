// API helper for Cabinet Zormati
const API = {
  base: window.location.origin, // same origin when served by Express

  async request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  },

  // RDV
  createRdv: (data) => API.request('POST', '/api/rdv', data),
  getRdvs: () => API.request('GET', '/api/rdv'),
  updateRdv: (id, data) => API.request('PATCH', `/api/rdv/${id}`, data),

  // Patients
  getPatients: () => API.request('GET', '/api/patients'),
  loginPatient: (identifier) => API.request('POST', '/api/patients/login', { identifier }),
  getPatient: (id) => API.request('GET', `/api/patients/${id}`),
  addSessions: (id, count) => API.request('POST', `/api/patients/${id}/add-sessions`, { count }),
  completeSession: (id, note) => API.request('POST', `/api/patients/${id}/complete-session`, { note }),

  // Admin
  adminLogin: (password) => API.request('POST', '/api/admin/login', { password })
};
