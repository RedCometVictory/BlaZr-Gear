import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = props => {
  return (
    <section className="not-found-wrapper">
      <h1>
        <i className="fas fa-exclamation-triangle"></i>{" "}Page Not Found!
      </h1>
      <div className="not-found-card">
        <div className="not-found-content">
          <p className="not-found-text">Sorry, this page does not exist!</p>
          <Link to="/shop" className="btn btn-secondary not-found-btn">Back to Product page</Link>
        </div>
      </div>
    </section>
  );
};
export default NotFound;