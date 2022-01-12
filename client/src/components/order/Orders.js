import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUserOrders } from '../../redux/actions/orderActions';
import Paginate from '../layouts/Paginate';
import Spinner from '../layouts/Spinner';
import OrderItem from './OrderItem';

const Orders = () => {
  const dispatch = useDispatch();
  const allOrders = useSelector(state => state.order);
  const { loading, orders, page, pages} = allOrders;
  const [hasMounted, setHasMounted] = useState(false);
  let [currentPage, setCurrentPage] = useState(page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    dispatch(getAllUserOrders(currentPage, itemsPerPage));
  }, [dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const itemCountChange = (e) => {
    if (e.target.value > itemsPerPage) {
      let orderCount = pages;
      let newItemsPerPage = e.target.value;
      let newSetPage = orderCount / newItemsPerPage;
      Math.floor(newSetPage);
      setCurrentPage(currentPage = Math.floor(newSetPage));
    }
    setItemsPerPage(Number(e.target.value)); // 12 or 20, dropdown
  };

  const pageChange = (chosenPage) => {
    setCurrentPage(chosenPage);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <>
      <section className="orders">
        <div className="orders__header">
          <h2 className="orders__title">My Orders</h2>
          <div className="orders__sub-header">
            <div className="total-items">
              <span>Orders per Page:{" "}</span>
            </div>
            <select name="itemCount" value={itemsPerPage} onChange={e => itemCountChange(e)}>
              <option value="12">12</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
        <div className="orders__content">
          <div className="orders__list">
            {orders && orders.length > 0 ? (
              orders.map(order => (
                <OrderItem key={order.id} order={order} />
              ))
            ) : (
              <div className="">No orders found.</div>
            )}
          </div>
        </div>
      </section>
      <Paginate currentPage={currentPage} itemsPerPage={itemsPerPage} pages={pages} pageChange={pageChange} />
      </>
    )}
    </>
  )
}
export default Orders;