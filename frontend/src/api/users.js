import api from './axios';

export const getUsers = () => api.get('/users');
export const makeAdmin = (id) => api.patch(`/users/${id}/make-admin`);
