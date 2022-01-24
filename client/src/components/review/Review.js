import React from 'react';
import ReviewItem from './ReviewItem';

const Review = ({reviews}) => {
  return (
    <section className="reviews">
      {reviews.length === 0 ? (
        <div className="">No reviews available.</div>
      ) : (
        reviews.map(review => (
          <ReviewItem key={review.id} review={review} />
        ))
      )}
    </section>
  )
}
export default Review;