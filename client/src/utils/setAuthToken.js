// takes token from auth action, if there, add it to Authorization headers, if not - delete header
import api from './api';

// When we have a token, it's sent with every request.
const setAuthToken = token => {
  // console.log("token")
  // console.log(token)
  // token value derived from localstorage
  if (token) {
    // set global header to value of token passed in:
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // set token to LS
    localStorage.setItem('token', token);
  } else {
    // if token is expired (perhaps do a refresh, then continue with a second url request followed by setting the token into the header)
    // if no token, delete global header
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}
// pass value back into (auth) actions
export default setAuthToken;