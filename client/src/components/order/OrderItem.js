import React from 'react';
import { Link } from 'react-router-dom';

const OrderItem = ({
  order: {
    id, is_delivered, is_paid, paid_at, is_refunded, refunded_at, payment_method, total_price
  }
}) => {
  return (
    <div className="orderItem">
      <div className="orderItem__row">
        <div className="orderItem__id item">
          <p>#ID: {id}</p>
        </div>
        <div className="orderItem__order-paid">
          <div className="orderItem__item-total item">Paid On: {paid_at}</div>
          <div className="orderItem__ship-status item">Paid: {is_paid ? 'true' : 'false'}</div>
        </div>
        <div className="orderItem__payment item">
          <div className="">
            Payment Method: {payment_method ? payment_method : 'unknown'}
          </div>
        </div>
        <div className="orderItem__delivery">
          <p>Delivery Status:</p>
          <p>{is_delivered ? 'Delivered' : 'Not Yet Delivered'}</p>
        </div>
        <div className="orderItem__grand-total item">
          <p>Grand Total: ${total_price}</p>
          <div className="refund">
            {is_refunded ? (<p className="notice">REFUNDED</p>) : (<p></p>)}
          </div>
          <div className="refund">
            <p>{refunded_at ? `On: ${refunded_at}` : ''}</p>
          </div>
        </div>
        <div className="orderItem__detail">
          <Link className="btn btn-secondary" to={`/order/${id}/detail`}>View</Link>
        </div>
      </div>
    </div>
  )
}
export default OrderItem;