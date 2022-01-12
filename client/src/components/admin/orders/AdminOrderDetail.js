import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams, useHistory } from "react-router-dom";
import Spinner from '../../layouts/Spinner';
import { getOrderDetailAdmin, updateOrderStatusToShipped, deliverOrder, deleteOrder, refundPayPalOrder } from '../../../redux/actions/orderActions';
import { refundCharge } from '../../../redux/actions/stripeActions';

const AdminOrderDetail = () => {
  const { order_id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const authDetails = useSelector(state => state.auth);
  const orderDetails = useSelector(state => state.order);
  let { loading, order } = orderDetails;
  let { userInfo } = authDetails;
  const [hasMounted, setHasMounted] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [refund, setRefund] = useState(false);
  const [isShipped, setIsShipped] = useState(false);
  
  useEffect(() => {
    dispatch(getOrderDetailAdmin(order_id));
  }, [dispatch, order_id]);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) return null;
  
  const updateShippingHandler = (value, orderID = '') => {
    setIsShipped(value);
    if (orderID) dispatch(updateOrderStatusToShipped(order_id)); 
  };
  const updateDeliveryHandler = (value, orderID = '') => {
    setDelivery(value);
    if (orderID) dispatch(deliverOrder(order_id));
  };
  const refundHandler = (value, orderID = '') => {
    setRefund(value);
    if (orderID && order?.orderInfo?.payment_method === "PayPal") {
      dispatch(refundPayPalOrder(order_id, userInfo.id, order?.orderInfo?.paypal_order_id, order?.orderInfo?.paypal_capture_id, order?.orderInfo?.total_price));
    }
    if (orderID && order?.orderInfo?.payment_method === "Stripe") {
      dispatch(refundCharge(order_id, userInfo.id, order?.orderInfo?.stripe_payment_id, order?.orderInfo?.total_price));
    }
  };
  const deleteOrderHandler = (value, orderID = '') => {
    setToDelete(value)
    if (orderID) dispatch(deleteOrder(order_id, history));
  };

  const RefundModal = ({order, show, showHandler}) => {
    let activeClass = show ? 'active' : '';
    return (
      <section className={`admOrder__modal refund ${activeClass}`}>
        <div className="admOrder__modal-container">
          <div className="header">
            <h3>Refund Order?</h3>
          </div>
          <div className="content">
            <div className="price">${order?.total_price}</div>
            <div className="btn-sec">
              <button
                className="btn btn-secondary"
                onClick={(e) => showHandler(false)}
              >
                No
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => refundHandler(false, true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const ShippingModal = ({order, show, showHandler}) => {
    let activeClass = show ? 'active' : '';
    return (
      <section className={`admOrder__modal shipping ${activeClass}`}>
        <div className="admOrder__modal-container">
          <div className="header">
            <h3>Update Order to Shipped</h3>
          </div>
          <div className="content">
            <div className="price">
              <p>Please confirm that product has been shipped. Update order status from 'processing' to 'shipped'.</p>
            </div>

            <div className="btn-sec">
              <button
                className="btn btn-secondary"
                onClick={(e) => showHandler(false)}
              >
                No
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => updateShippingHandler(false, true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const DeliveryModal = ({order, show, showHandler}) => {
    let activeClass = show ? 'active' : '';
    return (
      <section className={`admOrder__modal delivery ${activeClass}`}>
        <div className="admOrder__modal-container">
          <div className="header">
            <h3>Update Order to Delivered</h3>
          </div>
          <div className="content">
            <div className="price">
              <p>Please confirm that product has been delivered to customer or location. Update order status from 'shipped' to 'delivered'.</p>
            </div>
            <div className="btn-sec">
              <button
                className="btn btn-secondary"
                onClick={(e) => showHandler(false)}
              >
                No
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => updateDeliveryHandler(false, true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const DeleteModal = ({show, showHandler}) => {
    let activeClass = show ? 'active' : '';
    return (
      <section className={`admOrder__modal delete ${activeClass}`}>
        <div className="admOrder__modal-container">
          <div className="header">
            <h3>Delete Order?</h3>
          </div>
          <div className="content">
            <div className="price">
              <p>Confirm that order payment method is listed as "unknown". Meaning that the payment of the order did not occur, complete, or was unsuccessful in some way. This ensures that it is safe to delete the order as it did not complete due to some error.</p>
            </div>
            <div className="btn-sec">
              <button
                className="btn btn-secondary"
                onClick={(e) => showHandler(false)}
              >
                No
              </button>
              <button
                className="btn btn-secondary"
                onClick={(e) => deleteOrderHandler(false, true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
    {loading ? (
      <Spinner />
    ) : order ? (
      <section className="admOrder">
        <div className="admOrder__header">
          <h2>Order #ID: {order_id}</h2>
        </div>
        <RefundModal order={order?.orderInfo} show={refund} showHandler={setRefund}/>
        <DeliveryModal order={order?.orderInfo} show={delivery} showHandler={setDelivery}/>
        <ShippingModal order={order?.orderInfo} show={isShipped} showHandler={setIsShipped}/>
        <DeleteModal show={toDelete} showHandler={setToDelete}/>
        <div className="admOrder__container">
          <div className="admOrder__sub-header">
            <h4 className="admOrder__item-count">Order Item Total: {order?.orderItems?.length}</h4>
            <div className="btn btn-secondary">
              <Link to={`/admin/order-list`} >
                Orders
              </Link>
            </div>
          </div>
          <div className="admOrder__general">
            <div className="admOrder__user-info">
              <div className="set-one">
                <div className="">#ID:</div>
                <div className="usr-brk">{order?.userInfo?.id}</div>
                <div className="">Fullname:</div>
                <div className="">{order?.userInfo?.f_name}  {order?.userInfo?.l_name}</div>
              </div>
              <div className="set-two">
                <div className="">E-mail:</div>
                <div className="usr-brk">{order?.userInfo?.user_email}</div>
                <div className="">User Role:</div>
                <div className="">{order?.userInfo?.role}</div>
              </div>
              <div className="set-three">
                <div className="">User Stripe ID:</div>
                <div className="usr-brk">{order?.userInfo?.stripe_cust_id}</div>
              </div>
            </div>
            <div className="admOrder__admin-options">
              <div className="status">
                <h4>Order Status:</h4>
                <div className="">
                  {order?.orderInfo?.order_status ? order.orderInfo.order_status :'Unknown'}
                </div>
              </div>
              <div className="deliver">
                {order?.orderInfo?.order_status === 'processing' || order?.orderInfo?.order_status === null ? (
                  <>
                  <h4>Update Order Status:</h4>
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => updateShippingHandler(true)}
                  >
                    Update
                  </button>
                  </>
                ) : (
                  <>
                  <h4>Update Delivery Status:</h4>
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => updateDeliveryHandler(true)}
                    disabled={order?.orderInfo?.is_delivered || order?.orderInfo?.is_refunded}
                  >
                    {order?.orderInfo?.is_delivered ? 'Delivered' : 'Update'}
                  </button>
                  </>
                )}
              </div>
              <div className="refund">
                <h4>Refund Order:</h4>
                <button
                  className="btn btn-secondary"
                  onClick={(e) => refundHandler(true)}
                  disabled={order?.orderInfo?.is_refunded}
                >
                  {order?.orderInfo?.is_refunded ? 'Refunded' : 'Refund'}
                </button>
              </div>
              <div className="delete">
                <h4>Delete Order:</h4>
                <button className="btn btn-secondary" onClick={(e) => deleteOrderHandler(true)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
          <div className="admOrder__status">
            <div className="sub">
              <div className="sec s1">
                <h4>Payment</h4>
                <div className="">
                  {order?.orderInfo?.is_paid ? 'PAID' : 'NOT PAID'}
                </div>
              </div>
              <div className="sec s2">
                <h4>Delivery</h4>
                <div className="">
                  {order?.orderInfo?.is_delivered ? 'DELIVERED' : 'NOT DELIVERED'}
                </div>
              </div>
              <div className="sec s3">
                <h4>Method</h4>
                <div className="">
                  {order?.orderInfo?.payment_method ? order?.orderInfo?.payment_method : 'Unknown'}
                </div>
              </div>
            </div>
            <div className="set-two">
              <div>Subtotal: ${order?.orderInfo?.amount_subtotal}</div>
              <div>Shipping: ${order?.orderInfo?.shipping_price}</div>
              <div>Tax: ${order?.orderInfo?.tax_price}</div>
              <div>Total: ${order?.orderInfo?.total_price}</div>
            </div>
          </div>
          <div className="admOrder__details">
            {order?.orderItems?.map(item => (
              <div className="admOrder__detail" key={item.id}>
                <div className="admOrder__image">
                  <Link to={`/product/${item.product_id}`} >
                    <img className="admOrder__img" src={item.product_image_url} alt="product view" />
                  </Link>
                </div>
                <div className="admOrder__info">
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
                  <div className="set-two">$ {item.price}</div>
                  <div className="set-three">Quantity: {item.quantity}</div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : (
      <section className="admOrder">
        <div className="admOrder__header">
          <h2>Order #ID: {order_id}</h2>
        </div>
        <div className="admOrder__container">
          <div className="admOrder__sub-header">
            <div className="btn btn-secondary">
              <Link to={`/admin/order-list`} >
                Orders
              </Link>
            </div>
          </div>
        </div>
        <div className="admOrder__not-found">
          Order not found.
        </div>
      </section>
    )}
    </>
  )
}
export default AdminOrderDetail;