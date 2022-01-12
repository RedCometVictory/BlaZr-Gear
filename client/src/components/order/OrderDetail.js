import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from "react-router-dom";
import Spinner from '../layouts/Spinner';
import { getOrderDetails } from '../../redux/actions/orderActions';

const OrderDetail = () => {
  const { order_id } = useParams();
  const dispatch = useDispatch();
  const orderDetails = useSelector(state => state.order);
  const { loading, order } = orderDetails;
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    dispatch(getOrderDetails(order_id));
  }, [dispatch, order_id]);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) return null;
  
  return (
    <>
    {loading ? (
      <Spinner />
    ) : order ? (
      <section className="order">
        <div className="order__header">
          <h2>Order #ID: {order_id}</h2>
        </div>
        <div className="order__container">
          <div className="order__sub-header">
            <h4 className="order__item-count">Order Item Total: {order?.length}</h4>
            <div className="btn btn-secondary">
              <Link to={`/orders`} >
                Orders
              </Link>
            </div>
          </div>
          <div className="order__details">
            {order?.map(item => (
              <div className="order__detail" key={item.id}>
                <div className="order__image">
                  <Link to={`/product/${item.product_id}`} >
                    <img className="order__img" src={item.product_image_url} alt="forest view" />
                  </Link>
                </div>
                <div className="order__info">
                  <div className="set-one">
                    <h4>Shipping Info</h4>
                    <div>
                      <Link to={`/product/${item.product_id}`} >
                        Name: {item.name}
                      </Link>
                    </div>
                    <div>Brand: {item.brand}</div>
                    <div>Category: {item.category}</div>
                    <div>Purchased: {item.created_at}</div>
                  </div>
                  <div className="set-two">
                    <div>Subtotal: {item.amount_subtotal}</div>
                    <div>Shipping: {item.shipping_price}</div>
                    <div>Tax: {item.tax_price}</div>
                    <div>Total: {item.total_price}</div>
                  </div>
                  <div className="set-three">
                    <div className="">
                      <h4>Payment</h4>
                      <div className="">
                        {item.is_paid ? 'PAID' : 'NOT PAID'}
                      </div>
                    </div>
                    <div className="">
                      <h4>Order Status</h4>
                      <div className="">
                        {item.is_delivered ? 'DELIVERED' : 'SHIPPED'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : (
      <section className="order">
        <div className="order__header">
          <h2>Order #ID: {order_id}</h2>
        </div>
        <div className="order__container">
          <div className="order__sub-header">
            <div className="btn btn-secondary">
              <Link to={`/orders`} >
                Orders
              </Link>
            </div>
          </div>
        </div>
        <div className="order__not-found">
          Order not found.
        </div>
      </section>
    )}
    </>
  )
}
export default OrderDetail;