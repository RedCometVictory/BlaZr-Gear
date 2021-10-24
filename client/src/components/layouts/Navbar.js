import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaCaretDown,  FaShoppingCart } from 'react-icons/fa';
import ModeButton from './ModeButton';
import { logout } from '../../redux/actions/authActions';
import Search from './Search';

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const userAuth = useSelector(state => state.auth);
  const cart = useSelector(state => state.cart);
  const { isAuthenticated, userInfo } = userAuth;
  const { cartItems } = cart;
  const [hasMounted, setHasMounted] = useState(false);
  const [isChecked, setIsChecked] = useState(false);


  // useEffect(() => {
  //   let quantity = cartItems.
  // }, [cartItems]);
  // const getCartItemCount = (cartItems) => {
  // cartItems.reduce((qty, item) => Number(item.qty) + qty, 0);
  // cartItems.reduce((acc, item) => Number(item.qty += acc, 0));

  useEffect(() => {
    setHasMounted(true);
    // if (!isAuthenticated) return dispatch(getCartGuest());
    // if (isAuthenticated) return dispatch(getCart());
    // dispatch(getCartGuest());
  // }, [dispatch, isAuthenticated]);
  }, [dispatch]);

  if (!hasMounted) {
    return null;
  }
  
  const getCartItemCount = () => {
    return cartItems.reduce((qty, item) => Number(item.qty) + qty, 0)
  }

  const handleLogout = () => {
    dispatch(logout(history));
  }
  // feed is for all posts of users followed and self
  const authLinks = (
    <>
    <li className="nav__link-item--secondary">
      <Link to="/orders">Orders</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/profile">Account</Link>
    </li>
    <li className="nav__link-item--secondary">
      <div onClick={handleLogout}>Logout</div>
    </li>
    </>
  );

  const adminLinks = (
    <>
    <li className="nav__link-item--secondary">
      <Link to="/admin/slide/list">Slides</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/admin/user-list">Users</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/admin/product-list">Products</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/admin/order-list">Orders</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/profile">{userInfo && (userInfo?.f_name)}</Link>
    </li>
    <li className="nav__link-item--secondary">
      <div onClick={handleLogout}>Logout</div>
    </li>
    </>
  );

  const guestLinks = (
    <>
    <li className="nav__link-item--secondary">
      <Link to="/login">Login</Link>
    </li>
    <li className="nav__link-item--secondary">
      <Link to="/register">Create Account</Link>
    </li>
    </>
  );

  // login/logout, cart, cart total count of items, account
  // dropdown (for account link when clicked): username (not link), profile link, orders link, searchbar, CATERGories (drop down of categories), shop

  // let loginStatus = isAuthenticated ? `${userInfo.name}` : 'Login';
  // let loginStatus = userInfo && isAuthenticated ? `${userInfo.f_name}` : 'Login';
  // let loginStatus = !isAuthenticated ? 'Login' : userInfo.role === 'admin' &&  isAuthenticated ? 'Admin' : `${userInfo.f_name}`
  // let loginStatus = !isAuthenticated ? 'Login' : userInfo && userInfo?.role === 'admin' &&  isAuthenticated ? 'Admin' : `${userInfo.f_name}`
  return (
    <header className="nav">
      <div className="nav__logo">
        <h1><Link to="/" className="logo">BlaZr Gear</Link></h1>
      </div>
      <div className="nav__link-bar">
        {/* <input type="text" placeholder="search products" className="search"/> */}
        <Search />
      </div>
      <div className="nav__menu-content">
        <input type="checkbox" name="toggler" className="nav__toggler" />
        <label htmlFor="toggler" className="nav__burger"></label>
        <nav className="nav__menu">
          <ul className="nav__links">
            <li className="nav__link-item">
              <Link to="/shop" className="nav__link">Shop</Link>
            </li>
            <li className="nav__link-item">
              <input
                type="checkbox" 
                className="nav__caret-toggle"
                onChange={e => setIsChecked(e.currentTarget.checked)}
                checked={isChecked}
              />
              <span
                className="nav__link"
                onClick={() => setIsChecked(!isChecked)}
              >
                {!isAuthenticated ? 'Login' : userInfo?.role === 'admin' &&  isAuthenticated ? 'Admin' : userInfo && (`${userInfo.f_name}`)}
                {/* {loginStatus} */}
                <span><FaCaretDown className="nav__caret" /></span>
              </span>
              <ul className="nav__links--secondary">
              {/* {isAuthenticated ? authLinks : guestLinks} */}
                {/* {!isAuthenticated ? (
                  {guestLinks}
                ) :  (
                  {authLinks}
                )} */}
                {!isAuthenticated ? (
                  guestLinks
                ) : userInfo?.role === 'admin' &&  isAuthenticated ? (
                  adminLinks
                ) : (
                  authLinks
                )}
                {/* {!isAuthenticated ? (
                  guestLinks
                ) : userInfo.role !== 'admin' &&  isAuthenticated ? (
                  authLinks
                ) : userInfo.role === 'admin' && isAuthenticated ? (
                  adminLinks
                ) : (
                  authLinks
                )} */}
                {/* {isAuthenticated && userInfo.role === 'admin' && (adminLinks)} */}
                {/* {!userRole && userInfo.role? !== 'admin' && (
                  isAuthenticated ? authLinks : guestLinks
                )}
                {isAuthenticated && userInfo.role === 'admin' && (adminLinks)} */}
              </ul>
            </li>
          </ul>
        </nav>
        <Link to={'/cart'} className="nav__cart">
          <div className="nav__cart-item">
            {getCartItemCount()}
          </div>
          <div className="nav__cart-icon">
            <FaShoppingCart />
          </div>
        </Link>
        <div className="nav__theme-select" >
          <ModeButton />
        </div>
      </div>
    </header>
  )
};
export default Navbar;