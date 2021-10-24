import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllSlides } from '../../../redux/actions/slideActions';
import AdminSlideItem from './AdminSlideItem';

const AdminSlideList = () => {
  const dispatch = useDispatch();
  const slideDetails = useSelector(state => state.slide);
  const { loading, slides } = slideDetails;
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // setIsLoading(true);
    dispatch(getAllSlides());
  }, [dispatch]);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return (
    <>
    {loading ? (
      <div className="">Loading Info</div>
    ) : (
      <section className="admProducts">
        <div className="admProducts__header">
          <h2 className="admProducts__title">Slideshow Content</h2>
          <div className="admProducts__header-options">
            <div className="admProducts__create-item">
              <Link to="/admin/slide/create">
                <button className="btn btn-secondary">
                  Add Slide
                </button>
              </Link>
            </div>
            <div className="admProducts__total-items">
              {slides.length} Slides
            </div>
          </div>
        </div>
        <div className="admProducts__content">
          <div className="admProducts__list">
            <>
            {slides && slides.length > 0 ? (
              slides.map(slide => (
                <AdminSlideItem key={slide.id} slide={slide} />
              ))
            ) : (
              <div className="">No slides exist.</div>
            )}
            </>
          </div>
        </div>
      </section>
    )}
    </>
  )
}
export default AdminSlideList;