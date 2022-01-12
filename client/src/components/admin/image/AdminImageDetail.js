import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getImageDetails, deleteImage } from '../../../redux/actions/imageActions';
import Spinner from '../../layouts/Spinner';

const AdminImageDetail = () => {
  const { image_id } = useParams();
  const history = useHistory();
  // const myRef = useRef();
  const dispatch = useDispatch();
  const imageDetail = useSelector(state => state.image);
  const { loading, image } = imageDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    dispatch(getImageDetails(image_id));
  }, [dispatch, image_id]);  

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  // const scrollToUpdateForm = () => myRef.current.scrollIntoView({ behavior: 'smooth'});

  return (
    <>
    {loading ? (
      <Spinner />
    ) : (
      <section className="admProductDetail">
        <div className="admProductDetail__title">
          <h2>ID#: {image.id}</h2>
        </div>
        {confirmDelete && (
          <div className="admProductDetail__delete-confirm">
            <div>
              <p>Are you sure you want to permanently delete this image? Image will no longer show in the shop or product details. Deleting cannot be reversed. Please confirm.</p>
            </div>
            <div className="admProductDetail__delete-btns">
              <button className="btn btns del-primary" onClick={e => dispatch(deleteImage(image.id, history))}>Yes</button>
              <button className="btn btns del-secondary" onClick={() => setConfirmDelete(false)}>No</button>
            </div>
          </div>
        )}
        <div className="admProductDetail__details">
          <div className="admProductDetail__image">
            <img className="admProductDetail__img" src={image.product_image_url} alt="forest view" />
          </div>
          <div className="admProductDetail__info image-info">
            <div className="admProductDetail__info-inner image-info">
              <h3>Image Information</h3>
              <div>
                <span className="title">Product ID#: </span>{image.product_id}
              </div>
              <div>
                <span className="title">Filename: </span>{image.product_image_filename}
              </div>
              <div>
                <span className="title">Order Items using Image: </span>{image.count}
              </div>
              <div>
                <span className="title">Image Created: </span>{image.created_at}
              </div>
            </div>
            <div className="admProductDetail__btn-container">
              <div className="">
                <Link to='/admin/image/list'>
                  <div className="btn btn-primary update-btn">
                    Image List
                  </div>
                </Link>
              </div>
              <button className="btn btn-secondary delete-btn" onClick={() => setConfirmDelete(true)}>Delete Image</button>
            </div>
          </div>
        </div>
      </section>
    )}
    </>
  )
}
export default AdminImageDetail;