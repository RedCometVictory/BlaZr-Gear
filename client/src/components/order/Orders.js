import React from 'react';
import OrderItem from './OrderItem';


const Orders = () => {
  return (
    <section className="orders">
      <div className="orders__header">
        <h2 className="orders__title">Your Orders</h2>
        <div className="orders__total-items">15 Orders</div>
      </div>
      <div className="orders__content">
        <div className="orders__list">
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
          <OrderItem />
        </div>
      </div>
    </section>
  )
}
export default Orders;