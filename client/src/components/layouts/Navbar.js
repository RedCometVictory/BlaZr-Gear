import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaCaretDown, FaBars, FaShoppingCart } from 'react-icons/fa';
import ModeButton from './ModeButton';
import { logout } from '../../redux/actions/authActions';
import Search from './Search';
// import CartList from './CartList';
// import useClickOutside from '../../hooks/useClickOutside';
// import useWindow from '../../hooks/useWindow';

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const caretToggleRef = useRef();
  // const cartIconRef = useRef();
  // const { height, width } = useWindow();
  const userAuth = useSelector(state => state.auth);
  const cart = useSelector(state => state.cart);
  const { isAuthenticated, userInfo } = userAuth;
  const { cartItems } = cart;
  const [hasMounted, setHasMounted] = useState(false);
  const [caretChecked, setCaretChecked] = useState(false);
  // const [showCart, setShowCart] = useState(false);
  const [caretCheckedDesktop, setCaretCheckedDesktop] = useState(false);

  // for use with cart list, if in the form of a sidebar
  // useClickOutside(cartIconRef, () => setShowCart(true));
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

  // const showCartHandler = (value) => {
  //   dispatch(setAlert(`Show Cart = ${value}`, 'success'));
  //   // if (showCart) return;
  //   if (!showCart) setShowCart(true);
  //   // setShowCart(true);
  // };
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
      <Link to="/orders">My Orders</Link>
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

  const handleCaretChecked = (e) => {
      setCaretChecked(e.currentTarget.checked)
  };

  return (
    <header className="nav">
      <div className="nav__logo">
        <h1><Link to="/" className="logo">BlaZr Gear</Link></h1>
      </div>
      <div className="nav__link-bar">
        <Search />
      </div>
      <div className="nav__menu-content">
        <input type="checkbox" name="toggler" className="nav__toggler" />
        <label htmlFor="toggler" className="nav__burger">
          <FaBars />
          <div className="x">X</div>
        </label>
        <nav className="nav__menu">
          <ul className="nav__links small">
            <li className="nav__link-item">
              <Link to="/shop" className="nav__link">Shop</Link>
            </li>
            <li className="nav__link-item role-link">
              <input
                type="checkbox" 
                className="nav__caret-toggle"
                onChange={e => handleCaretChecked(e)}
                checked={caretChecked}
              />
              <span
                className="nav__link role-link"
                onClick={() => setCaretChecked(!caretChecked)}
              >
                {!isAuthenticated ? 'Login' : userInfo?.role === 'admin' &&  isAuthenticated ? 'Admin' : userInfo && (`${userInfo.f_name}`)}
                <span><FaCaretDown className="nav__caret" /></span>
              </span>
              <ul className="nav__links--secondary small">
                {!isAuthenticated ? (
                  guestLinks
                ) : userInfo?.role === 'admin' &&  isAuthenticated ? (
                  adminLinks
                ) : (
                  authLinks
                )}
              </ul>
            </li>
          </ul>
          <ul className="nav__links large">
            <li className="nav__link-item">
              <Link to="/shop" className="nav__link">Shop</Link>
            </li>
            <li className="nav__link-item role-link">
              <input
                type="checkbox" 
                className="nav__caret-toggle"
                onChange={e => setCaretCheckedDesktop(e.currentTarget.checked)}
                checked={caretCheckedDesktop}
                ref={caretToggleRef}
              />
              <span
                className="nav__link role-link"
                onClick={() => setCaretCheckedDesktop(!caretCheckedDesktop)}
              >
                {!isAuthenticated ? 'Login' : userInfo?.role === 'admin' &&  isAuthenticated ? 'Admin' : userInfo && (`${userInfo.f_name}`)}
                <span><FaCaretDown className="nav__caret" /></span>
              </span>
              <ul className="nav__links--secondary large">
                {!isAuthenticated ? (
                  guestLinks
                ) : userInfo?.role === 'admin' &&  isAuthenticated ? (
                  adminLinks
                ) : (
                  authLinks
                )}
              </ul>
            </li>
          </ul>
        </nav>
        <div className="nav__cart">
          <Link to={'/cart'} className="">
            <div className="nav__cart-item">
              {getCartItemCount()}
            </div>
            <div className="nav__cart-icon">
              <FaShoppingCart />
            </div>
          </Link>
        </div>
        <div className="nav__theme-select small" >
          <ModeButton />
        </div>
        <div className="nav__theme-select large" >
          <ModeButton />
        </div>
        {/* <CartList ref={cartIconRef} showCart={showCart} setShowCart={setShowCart} cartItems={cartItems} /> */}
      </div>
    </header>
  )
};
export default Navbar;