// import { refreshToken } from '../redux/actions/authActions';

// export function jwtRefresh ({ dispatch }) {
  
// };

// export function jwtRefresh ({ dispatch, getState }) {
//   return (next) => (action) => {
//     // only worry about expiring token for async actions
//     if (typeof action === 'function') {
//       if (getState().auth && getState().auth.token) {
//         // decode jwt so that we know if and when it expires
//         let tokenExpiration = jwtDecode(getState().auth.token).<your field for expiration>;
//         if (tokenExpiration && (moment(tokenExpiration) - moment(Date.now()) < 5000)) {
//           // make sure we are not already refreshing the token
//           if (!getState().auth.freshTokenPromise) {
//             return refreshToken(dispatch).then(() => next(action));
//           } else {
//             return getState().auth.freshTokenPromise.then(() => next(action));
//           }
//         }
//       }
//     }
//     return next(action);
//   };
// }