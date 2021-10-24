// require('dotenv').config();
import Axios from 'axios';
// import store from '../redux/store';
// import { LOGOUT } from '../redux/constants/authConstants';

const api = Axios.create({
  baseURL: 'http://localhost:5000/api',
  // baseURL: `${process.env.HEROKU_DOMAIN}/api`,
  // baseURL: `https://squadupsocial.herokuapp.com/api`,
  // baseURL: '/api',
  // baseURL: '/',
  // data: data,
  // headers: {
    // "Authorization": "Bearer "+localStorage.getItem("token"),
    // "Authorization": "Bearer "+localStorage.token && JSON.parse(localStorage.token)
    // 'X-Content-Type-Options': "nosniff",
    // 'Content-Type': 'application/json',
    // 'Content-Type': 'multipart/form-data',
    // 'Accept': 'application/json'
    // 'Accept': 'multipart/form-data'
  // },
  credentials: 'include',
});
// intercept err responses from api, check if the token is no longer valid. if expired / unauthenticated, attempt token refresh, if fails, logout user axios attempts these actions BEFORE actually making a req to the api server

api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);
// api.interceptors.response.use(
//   res => res,
//   err => {
//     if (err.response.status === 401) {
//       store.dispatch({ type: LOGOUT });
//     }
//     return Promise.reject(err);
//   }
// );
export default api;