import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { createProductReview } from '../../redux/actions/productActions';

const initialState = {
  title: '', description: ''
}

const ReviewForm = ({prodId}) => {
  const dispatch = useDispatch();
  const userAuth = useSelector(state => state.auth);
  const { isAuthenticated } = userAuth;
  const [reviewForm, setReviewForm] = useState(false);
  const [rating, setRating] = useState(1);
  const [reviewFormData, setReviewFormData] = useState(initialState);

  const { title, description } = reviewFormData;

  const onChangeHandler = (e) => {
    setReviewFormData({ ...reviewFormData, [e.target.name]: e.target.value });
  };
  
  const submitReviewHandler = e => {
    e.preventDefault();
    let formData = {...reviewFormData, rating};
    
    // dispatch(createProductReview(prod_id, reviewFormData));
    dispatch(createProductReview(prodId, formData));
    setReviewFormData({ title: '', description: '' });
    setRating(1);
  };

  let classes = "reviews__form-collapse right-comp";
  let classesShow = reviewForm ? classes += " active" : "";

  return (
    <section className="reviews">
      <div className="reviews__header">
        <div className="reviews__left-comp">
          {!isAuthenticated ? (
            <div className="reviews__form-collapse" onClick={() => setReviewForm(true)}>
              <Link className="" to={"/login"}>Sign In to Review</Link>
            </div>
          ) : !reviewForm ?(
            <div className="reviews__form-collapse" onClick={() => setReviewForm(true)}>
              <div className="">Add Review</div>
            </div>
          ) : (
            <div className="reviews__form-collapse form-submit">
              <input type="submit" form="review-form" value="Submit Review" />
            </div>
          )}
        </div>
        <h2>Reviews</h2>
        <div className={classes} onClick={() => setReviewForm(false)}>
          <div className="">Cancel Review</div>
        </div>
      </div>
      {reviewForm && (
        <form id='review-form' className="reviews__form" onSubmit={submitReviewHandler}>
          <div className="reviews__form-group">
            <ReactStars
              className="product__rating"
              count={5}
              size={18}
              value={rating}
              onChange={(newScore) => {
                setRating(newScore);
              }}
              activeColor='#e4d023'
            />
          </div>
          <div className="reviews__form-group">
            {/* <label htmlFor="title" className="label">Review Title</label> */}
            <input
              className="form-input"
              type="text"
              name="title"
              value={title}
              onChange={e => onChangeHandler(e)}
              placeholder="Review Title" aria-required="true" 
            />
          </div>
          <div className="reviews__form-group">
            <textarea
              className="form-textarea"
              name="description"
              placeholder="Write a review."
              onChange={e => onChangeHandler(e)}
              value={description}
              cols="30" rows="5" required
            ></textarea>
          </div>
        </form>
      )}
    </section>
  )
};
export default ReviewForm;