import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAdminOrders } from '../../../redux/actions/orderActions';
import Paginate from '../../layouts/Paginate';
import Spinner from '../../layouts/Spinner';
import AdminOrderItem from './AdminOrderItem';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const allOrders = useSelector(state => state.order);
  const {loading, orders, page, pages} = allOrders;
  const [hasMounted, setHasMounted] = useState(false);
  let [currentPage, setCurrentPage] = useState(page || 1);
  let [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    dispatch(getAllAdminOrders(currentPage, itemsPerPage));
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
      <section className="admOrders">
        <div className="admOrders__header">
          <h2 className="admOrders__title">Orders (Admin)</h2>
          <div className="admOrders__sub-header">
            <div className="total-items">
              <span>Orders per Page:{" "}</span>
            </div>
            <select name="itemCount" value={itemsPerPage} onChange={e => itemCountChange(e)}>
              <option value="12">12</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
        <div className="admOrders__content">
          <div className="admOrders__list">
            {orders && orders?.length > 0 ? (
              orders.map(order => (
                <AdminOrderItem key={order.id} order={order} />
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
export default AdminOrders;