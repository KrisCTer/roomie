import http from './httpClient';
const prefix = '/api/auth';

export const login = (payload) => http.post(`${prefix}/login`, payload).then(r=>r.data);
export const register = (payload) => http.post(`${prefix}/register`, payload).then(r=>r.data);
export const me = () => http.get(`${prefix}/me`).then(r=>r.data);
