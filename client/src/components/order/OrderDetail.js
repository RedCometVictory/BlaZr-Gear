import React from 'react';
// import { Link } from 'react-router-dom';
import Logo from '../../img/176236.jpg';

// order id
// # of items in order
// subtotal, shipping price, taxes, grand total
// payment method?
// order status: paid, processing, shipped, dekivered
// link to order detail page
const OrderDetail = () => {
  return (
    <section className="order">
      <div className="order__title">
        <h2>order title</h2>
      </div>
      <div className="order__details">
        <div className="order__image">
          <img className="order__img" src={Logo} alt="forest view" />
        </div>
        <div className="order__info">
          <h4>Shipping Info</h4>
          <div>Name: Firstname LastName</div>
          <div>Phone: 555-555-5555</div>
          <div>Subtotal: total</div>
          <div>Shipping: total</div>
          <div>Tax: total</div>
          <div>Total: grandtotal</div>
        </div>
      </div>
      <div className="order__status">
        <h4>Payment</h4>
        <div className="">
          isPaid ? PAID : NOT PAID
        </div>
        <h4>Order Status</h4>
        <div className="">
          isDelivered ? SHIPPED : DELIVERED
        </div>
        <h4>Order Items</h4>
        <div className="order__items-in-order">
          item image
          item name (link to product)
          item price
          item qty
        </div>
        {/* <div className="btn btn-cart-card btn-primary">
          <Link to="/cart/add">Add to Cart</Link>
        </div>
        <div className="btn btn-secondary">
          <Link to={`/order/detail`}>View Details</Link>
        </div> */}
      </div>
    </section>
  )
}
export default OrderDetail;