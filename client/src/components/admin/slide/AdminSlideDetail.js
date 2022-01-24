import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSlideDetails, deleteSlide } from '../../../redux/actions/slideActions'
import AdminSlideUpdate from './AdminSlideUpdate';
import Spinner from '../../layouts/Spinner';

const AdminSlideDetail = () => {
  const { slide_id } = useParams();
  const history = useHistory();
  const myRef = useRef();
  const dispatch = useDispatch();
  const slideDetail = useSelector(state => state.slide);
  const { loading, slide } = slideDetail;
  const [hasMounted, setHasMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  useEffect(() => {
    dispatch(getSlideDetails(slide_id));
  }, [dispatch, slide_id]);  

  useEffect(() => {
    if (confirmUpdate) {
      scrollToUpdateForm()
    }
  }, [confirmUpdate]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const scrollToUpdateForm = () => myRef.current.scrollIntoView({ behavior: 'smooth'});

  return loading ? (
    <Spinner />
  ) : (
    <section className="admProductDetail">
      <div className="admProductDetail__title">
        <h2>{slide.title}</h2>
        <div className="list-menu">
          <Link to='/admin/slide/list'>
            <div className="btn btn-secondary update-btn">
              Slide List
            </div>
          </Link>
        </div>
      </div>
      {confirmDelete && (
        <div className="admProductDetail__delete-confirm">
          <div>
            <p>Are you sure you want to delete this slide from the slideshow? Please confirm.</p>
          </div>
          <div className="admProductDetail__delete-btns">
            <button className="btn btns del-primary" onClick={e => dispatch(deleteSlide(slide.id, history))}>Yes</button>
            <button className="btn btns del-secondary" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        </div>
      )}
      <div className="admProductDetail__details">
        <div className="admProductDetail__image">
          <img className="admProductDetail__img" src={slide.image_url} alt="forest view" />
        </div>
        <div className="admProductDetail__info">
          <div className="admProductDetail__info-inner">
            <h3>Slide Information</h3>
            <div>
              <span className="title">ID#: </span>{slide.id}
            </div>
            <div>
              <span className="title">Title: </span>{slide.title}
            </div>
            <div>
              <span className="title">Category: </span>{slide.category}
            </div>
            <div>
              <span className="title">Theme: </span>{slide.theme}
            </div>
            <div>
              <span className="title">Slide Created: </span>{slide.created_at}
            </div>
          </div>
          <div className="admProductDetail__btn-container">
            <div className="">
              <Link to='/admin/slide/list'>
                <div className="btn btn-primary update-btn">
                  Slide List
                </div>
              </Link>
            </div>
            {confirmUpdate ? (
              <div className="btn btn-primary update-btn" onClick={() => setConfirmUpdate(false)}>
                Cancel Update
              </div>
            ) : (
              <div className="btn btn-primary update-btn" onClick={() => setConfirmUpdate(true)}>
                Update Slide
              </div>
            )}
            <button className="btn btn-secondary delete-btn" onClick={() => setConfirmDelete(true)}>Delete Slide</button>
          </div>
        </div>
      </div>
      <div className="admProductDetail__info-section two">
        <h3 className="info-header">Description</h3>
        <div className="description">
          {slide.description}
        </div>
      </div>
      <div className="admProductDetail__info-section three" ref={myRef}>
        {confirmUpdate && (
          <>
          <h2 className="info-header two">Update Slide Information</h2>
          <AdminSlideUpdate stateChanger={setConfirmUpdate} />
          </>
        )}
      </div>
    </section>
  )
}
export default AdminSlideDetail;