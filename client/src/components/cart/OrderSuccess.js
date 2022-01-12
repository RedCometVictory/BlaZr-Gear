import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addCardToUser } from '../../redux/actions/stripeActions';

const OrderSuccess = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const authDetails = useSelector(state => state.auth);
  const { userInfo } = authDetails;
  const [hasMounted, setHasMounted] = useState(false);
    
  useEffect(() => {
    setHasMounted(true);
    dispatch(addCardToUser(userInfo?.stripe_cust_id));
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  const redirectHandler = (e) => {
    history.push(`/${e.target.value}`);
  };

  return (
    <section className="orders">
      <div className="orders__success">
        <h2>Order Successful</h2>
        <div className="success-desc">
          <p>Continue shipping or review your orders.</p>
        </div>
        <div className="success-btns">
          <button
            className="btn btn-secondary"
            onClick={(e) => redirectHandler(e)}
            value={'shop'}
          >
            Shop
          </button>
          <button
            className="btn btn-secondary"
            onClick={(e) => redirectHandler(e)}
            value={'orders'}
          >
            Orders
          </button>
        </div>
      </div>
    </section>
  )
}
export default OrderSuccess;