import React from 'react';
import { Link } from 'react-router-dom';


const OrderItem = () => {
  return (
    <div className="orderItem">
      <div className="orderItem__row">
        <div className="orderItem__id item">#orderID</div>
        {/* <div className="orderItem__order-totals"> */}
          <div className="orderItem__item-total item">Item Total: 3</div>
          <div className="orderItem__ship-status item">Shipped</div>
          <div className="orderItem__payment item">
            Payment Method: Credit / Debit Card
          </div>
          <div className="orderItem__grand-total item">Grand Total: $161.88</div>
          <div className="orderItem__detail">
            <Link to="/order/id/detail">View Order</Link>
          </div>
        {/* </div> */}
      </div>
    </div>
  )
}
export default OrderItem;