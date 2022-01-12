import React from 'react';
import { Link } from 'react-router-dom';

const AdminOrderItem = ({
  order: {
    id, is_paid, paid_at, payment_method, is_delivered, delivered_at, is_refunded, refunded_at, paypal_order_id, paypal_capture_id, stripe_payment_id, user_id, amount_subtotal, shipping_price, tax_price, total_price
  }
}) => {
  return (
    <div className="admOrderItem">
      <div className="admOrderItem__row">
        <div className="admOrderItem__id item">
          <p>#ID:</p>
          <p>{id}</p>
        </div>
        <div className="admOrderItem__order-paid">
          <div className="admOrderItem__item-total item mg-top--sm">
            <p>Paid On:</p>
            <p>{paid_at}</p>
          </div>
          <div className="admOrderItem__ship-status item mg-top">
            <p>Paid:</p>
            <p>{is_paid ? 'true' : 'false'}</p>
          </div>
          <div className="admOrderItem__payment item mg-top">
            <p>Payment Method:</p>
            <p>{payment_method ? payment_method : 'unknown'}</p>
          </div>
          <div className="admOrderItem__ship-status item mg-top">
            {is_refunded ? (<p className="refund">REFUNDED</p>) : (<p></p>)}
          </div>
          <div className="admOrderItem__ship-status item mg-top">
            <p>{refunded_at ? `On: ${refunded_at}` : ''}</p>
          </div>
        </div>
        <div className="admOrderItem__delivery">
          <div className="mg-top--sm">
            <p>Delivery Status:</p>
          </div>
          <div className="">
            <p>{is_delivered ? 'Delivered' : 'Not Yet Delivered'}</p>
          </div>
          <div className="mg-top">
            <p>{delivered_at ? delivered_at : ''}</p>
          </div>
        </div>
        <div className="admOrderItem__identification">
          <div className="mg-top--sm">
            <p>User Id:</p>
            <p className="wd-brk">{user_id ? user_id : 'None.'}</p>
          </div>
          <div className="mg-top">
            <p>Stripe Id:</p>
            <p className="wd-brk">{stripe_payment_id ? stripe_payment_id : 'None.'}</p>
          </div>
          <div className="mg-top">
            <p>Paypal Order #:</p>
            <p className="wd-brk">{paypal_order_id ? paypal_order_id : 'None.'}</p>
          </div>
          <div className="mg-top">
            <p>Paypal Capture #:</p>
            <p className="wd-brk">{paypal_capture_id ? paypal_capture_id : 'None.'}</p>
          </div>
        </div>
        <div className="admOrderItem__price-totals">
          <div className="admOrderItem__grand-total item mg-top--sm">Sub-Total: ${amount_subtotal}</div>
          <div className="admOrderItem__grand-total item mg-top">Shipping Total: ${shipping_price}</div>
          <div className="admOrderItem__grand-total item mg-top">Tax Total: ${tax_price}</div>
          <div className="admOrderItem__grand-total item mg-top">Grand Total: ${total_price}</div>
        </div>
        <div className="admOrderItem__detail">
          <Link className="btn btn-secondary" to={`/admin/order/${id}/detail`}>View</Link>
        </div>
      </div>
    </div>
  )
}
export default AdminOrderItem;