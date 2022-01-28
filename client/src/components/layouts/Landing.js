import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ProductItem from '../product/ProductItem';
import { getAllSlides } from '../../redux/actions/slideActions';
import { listTopProducts } from '../../redux/actions/productActions';
// import {  } from "../layouts/"
import Spinner from './Spinner';

const Landing = () => {
  const dispatch = useDispatch();
  const products = useSelector(state => state.product);
  const slideShow = useSelector(state => state.slide);
  const { loading, slides } = slideShow;
  const { topProducts } = products;
  
  const [hasMounted, setHasMounted] = useState(false);
  let [showNotif, setShowNotif] = useState(true);
  const [index, setIndex] = useState(0);
  const length = slides.length;
  const timeout = useRef(null);
  let slideImgArr = [];
  let slideTitleArr = [];
  let slideDescArr = [];
  
  
  useEffect(() => {
    dispatch(getAllSlides());
    dispatch(listTopProducts());
  }, [dispatch]);

  
  if (slides) {
    for (let i = 0; i < slides.length; i++) {
      slideImgArr.push(slides[i].image_url);
      slideTitleArr.push(slides[i].title);
      slideDescArr.push(slides[i].description);
    }
  }

  const nextSlide = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setIndex(index === length - 1 ? 0 : index + 1);
  };

  const prevSlide = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setIndex(index === 0 ? length - 1 : index - 1);
  };
  const duration = 10000; // in ms ~ 10 secs
  // const duration = 1000000; // in ms ~ 10 mins
  useEffect(() => {
    const nextSlide = () => {
      setIndex(index => (index === length - 1 ? 0 : index + 1));
    };
    timeout.current = setTimeout(nextSlide, duration);
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      };
    };
  }, [index]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const CookieModal = ({show, showHandler}) => {
    let activeClass = show ? 'active' : '';
    return (
      <section className={`cookie-notif ${activeClass}`}>
        <div className="cookie-notif__container">
          <div className="cookie-notif__header">
          <h4 className="cookie-notif__header">NOTICE!</h4>
          <span onClick={(e) => showHandler(false)}>X</span>
          </div>
          <div className="cookie-notif__desc">
            <p>This website uses cookies in order to operate properly. Please disable any active cookie blockers.</p>
          </div>
          <button className="btn btn-secondary" onClick={(e) => showHandler(false)}>Close</button>
        </div>
      </section> 
    )
  };

  return (
    <>
    <section className="hero">
      <div className="hero__content">
        <div className="hero__slides">
          {loading ? (
            <Spinner />
          ) : (
            <>
            <CookieModal show={showNotif} showHandler={setShowNotif}/>
            <img src={slideImgArr[index]} alt="loading slideshow..." className="hero__slide-image" />
            </>
          )}
        </div>
        <div className="hero__arrows">
          <div className="arrow-cont">
            <div className="left" onClick={() => prevSlide()}>&#10094;</div>
          </div>
          <div className="arrow-cont">
            <div className="right" onClick={() => nextSlide()}>&#10095;</div>
          </div>
        </div>
        {loading ? (
          <></>
        ) : slideDescArr[index] !== null ? (
          <div className="hero__desc">
            <div className="title">{slideTitleArr[index]}</div>
            {slideDescArr[index]}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </section>
    <main className="container">
      {topProducts && topProducts.length > 0 && (
        <section className="products">
          <h2 className="top-prod">Top Selling Products</h2>
          <div className="products__container">
            {topProducts.map(product => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
    </>
  );
};
export default Landing;