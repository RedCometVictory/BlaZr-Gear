// takes token from auth action, if there, add it to Authorization headers, if not - delete header
import api from './api';

// When we have a token, it's sent with every request.
const setAuthToken = token => {
  // token value derived from localstorage
  if (token) {
    // set global header to value of token passed in:
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    // if no token, delete global header
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}
// pass value back into (auth) actions
export default setAuthToken;