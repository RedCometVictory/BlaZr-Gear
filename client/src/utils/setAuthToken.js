// takes token from auth action, if there, add it to Authorization headers, if not - delete header
import api from './api';

const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}
export default setAuthToken;