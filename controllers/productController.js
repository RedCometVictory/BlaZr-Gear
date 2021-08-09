const pool = require("../config/db");
const cloudinary = require('cloudinary').v2;

// pagination required - get all products
// /products/:pageNumber
// Public
exports.getAllProducts = async (req, res, next) => {
  const { pageNumber } = req.query;
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;
  
  try {
    // const keyword = req.query.keyword;
    const products = await pool.query(
      // 'SELECT P.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN reviews AS R ON P.id = R.product_id GROUP BY P.id LIMIT $1 OFFSET $2;', [limit, offset]
      // order content by id newest contenet at the top
      'SELECT P.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN reviews AS R ON P.id = R.product_id ORDER BY P.id DESC LIMIT $1 OFFSET $2;', [limit, offset]
    );
    
    let pages = products.rows.sort(() => Math.random() - 0.5);

    return res.status(200).json({
       status: "Product data retrieved.",
       data: {
         products: products.rows,
        //  page: page,
        //  pages: pages
       }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:id
// Public
exports.getProductById = async (req, res, next) => {
  const { prod_id } = req.params;
  
  try {
    const product = await pool.query(
      'SELECT P.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN reviews AS R ON P.id = R.product_id WHERE P.id = $1 GROUP BY P.id;' [prod_id]
    );
    
    if (!product) {
      return res.status(404).json({ errors: [{ msg: "Product not found." }] });
    }
    
    const productReviews = await pool.query(
      'SELECT U.username, R.* FROM reviews AS R JOIN users AS U ON U.id = R.user_id where R.product_id = $1;' [prod_id]
    );

    return res.status(200).json({
      status: "Success.",
      data: {
        product: product.rows[0],
        productReviews: productReviews.rows
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:prod_name - not needed as filter client side for product by name, clicking a product req by id???
// Public
exports.getAllProductByName = async (req, res, next) => {
  const { prod_name } = req.params;

  try {
    const product = await pool.query(
      'SELECT P.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN reviews AS R ON P.id = R.product_id WHERE P.name = $1 GROUP BY P.id;' [prod_name]
    );
  
    if (!product) {
      return res.status(404).json({ errors: [{ msg: "Product not found." }] });
    }

    const productID = product.rows[0].id;

    const productReviews = await pool.query(
      'SELECT U.username, R.* FROM reviews AS R JOIN users AS U ON U.id = R.user_id where R.product_id = $1;' [productID]
    );
  
    return res.status(200).json({
      status: "Success.",
      data: { product: product.rows[0] }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/top
// Public
exports.getTopProducts = async (req, res, next) => {
  
  try {
    const products = await pool.query(
      'SELECT P.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN reviews AS R ON P.id = R.product_id WHERE P.name = $1 ORDER BY review_avg ASC LIMIT 12;'
    );
    
    if (!products) {
      return res.status(404).json({ errors: [{ msg: "Products not found." }] });
    }

    return res.status(200).json({
      status: "Success.",
      data: { products: products.rows }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products
// Private / Admin
exports.createProduct = async (req, res, next) => {
  const { name, brand, category, description, price } = req.body;

  let productImgUrl = '';
  let productImgFilename = '';

  try {
    // provided via multer cloudinary
    if (req.file && req.file.path) {
      productImgUrl = req.file.path;
      productImgFilename = req.file.filename;
    }

    // if using diskstorage multer
    if (productImgUrl.startsWith('dist\\')) {
      let editProductImgUrl = productImgUrl.slice(4);
      productImgUrl = editProductImgUrl;
    }

    const product = await pool.query(
      'INSERT INTO products (name, product_image_url, product_image_filename, brand, category, description, price) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;' [name, productImgUrl, productImgFilename, brand, category, description, price]
    );
    return res.status(200).json({
      status: "Success. Product created.",
      data: { createdProduct: product.rows[0] }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:prod_id/review
// Private
exports.createProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id } = req.params;
  const { title, description, rating } = req.body;
  Number(rating);

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!product) {
      return res.status(404).json({ error: [{ msg: "Product does not exist." }] });
    };
    
    // check if user has not already reviewed the product
    const reviewExists = await pool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2;' [id, prod_id]
    );
      
    if (reviewExists) {
      return res.status(403).json({ error: [{ msg: "Unauthorized! User product review already exists." }] });
    };

    const createReview = await pool.query(
      'INSERT INTO reviews (title, description, rating, user_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;' [title, description, rating, id, prod_id]
    );

    return res.status(200).json({
      status: "Success! Product review created.",
      data: {
        review: createReview.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// /products/:prod_id/review/:review_id/comment
// Private / Admin / Staff?
exports.createProductReviewComment = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id } = req.params;
  const { title, description } = req.body;

  // TODO check if admin already made comment on review, create ability to update admin comment on post, and give user ability to edit their original review and possibly respond c=back to the original admin comment to pusrue a conversation (though it may be good to prevent conversation from happening in order to keep the review page consise and consistent)
  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!product) {
      return res.status(404).json({ error: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND review_id = $2;' [prod_id, review_id]
    );
      
    if (!reviewExists) {
      return res.status(404).json({ error: [{ msg: "Product review does not exist." }] });
    };

    const createReviewComment = await pool.query(
      'INSERT INTO comments (title, description, user_id, review_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;' [title, description, id, review_id, prod_id]
    );

    return res.status(200).json({
      status: "Success! Product review created.",
      data: {
        comment: createReviewComment.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// /products/:prod_id
// Private / Admin
exports.updateProduct = async (req, res, next) => {
  const { prod_id } = req.params;
  const { name, brand, category, description, price } = req.body;
  let productImgUrl = '';
  let productImgFilename = '';
  /* integrate multer cloudinary
    product_image_url
  product_image_filename
  */

  try {
    // provided via multer cloudinary
    if (req.file && req.file.path) {
      productImgUrl = req.file.path;
      productImgFilename = req.file.filename;
    }

    // if using diskstorage multer
    if (productImgUrl.startsWith('dist\\')) {
      let editProductImgUrl = productImgUrl.slice(4);
      productImgUrl = editProductImgUrl;
    }

    const findProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    }
    const product = await pool.query(
      'UPDATE products SET name = $1, product_image_url = $2, product_image_filename = $3, brand = $4, category=$5, description = $6, price = $7 WHERE id = $8 RETURNING *;', [name, confirmedProductImg, confirmedProductImgFilename, brand, category, description, price, prod_id]
    );

    return res.status(200).json({
      status: "Success. Product updated.",
      data: { product: product.rows[0] }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:prod_id/review
// Private
exports.updateProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id } = req.params;
  const { title, description, rating } = req.body;

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!product) {
      return res.status(404).json({ error: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2;' [prod_id, id]
    );
      
    if (!reviewExists) {
      return res.status(404).json({ error: [{ msg: "Product review does not exist." }] });
    };

    const updateReview = await pool.query(
      'UPDATE reviews SET title = $1, description = $2, rating = $3 WHERE user_id = $4 RETURNING *;' [title, description, rating, id]
    );

    return res.status(200).json({
      status: "Success! Product review created.",
      data: {
        review: updateReview.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// /products/:prod_id/review/:review_id/comment/:comment_id
// Private / Admin / Staff?
exports.updateProductReviewComment = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id, comment_id } = req.params;
  const { title, description } = req.body;

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!product) {
      return res.status(404).json({ error: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND id = $2;' [prod_id, review_id]
    );
      
    if (!reviewExists) {
      return res.status(404).json({ error: [{ msg: "Product review does not exist." }] });
    };

    // Admin, staff can make multiple comments on one review
    const updateReviewComment = await pool.query(
      'UPDATE comments SET title = $1, description = $2 WHERE id = $3 RETURNING *;' [title, description, comment_id]
    );

    return res.status(200).json({
      status: "Success! Product review created.",
      data: {
        comment: updateReviewComment.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// /products/:prod_id
// Private / Admin
exports.deleteProduct = async (req, res, next) => {
  const { prod_id } = req.params;
  
  try {
    const findProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    }

    let currProdImgFilename = findProduct.rows[0].product_image_filename;

    if (currProdImgFilename) {
      await cloudinary.uploader.destroy(currProdImgFilename);
    }

    const deleteProductReviewComments = await pool.query(
      'DELETE FROM comments WHERE product_id = $1;' [findProduct.rows[0].id]
    );
    const deleteProductReviews = await pool.query(
      'DELETE FROM reviews WHERE product_id = $1;' [findProduct.rows[0].id]
    );
    const deleteProductCartItems = await pool.query(
      'DELETE FROM cart_items WHERE product_id = $1;' [findProduct.rows[0].id]
    );
    const deleteProductOrderItems = await pool.query(
      'DELETE FROM oreder_items WHERE product_id = $1;' [findProduct.rows[0].id]
    );

    const deleteProduct = await pool.query(
      'DELETE FROM products WHERE id = $1;' [prod_id]
      // 'DELETE FROM products WHERE id = $1 RETURING *;' [prod_id]
    );

    // if (!deleteProduct)
    return res.status(200).json({
      status: "Success. Product deleted.",
      data: {message: "This product has been deleted."}
      // data: {product: deleteProduct.rows[0]}
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:prod_id/review
// Private
exports.deleteProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id } = req.params;
  
  try {
    const findProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    const findProductReview = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2;' [prod_id, id]
    );
      
    if (!findProductReview) {
      return res.status(404).json({ errors: [{ msg: "Review does not exist." }] });
    };

    const deleteProductReviewComments = await pool.query(
      'DELETE FROM comments WHERE review_id = $1;' [findProductReview.rows[0].id]
    );

    const deleteProductReview = await pool.query(
      'DELETE FROM reviews WHERE id = $1;' [findProductReview.rows[0].id]
    );

    return res.status(200).json({
      status: "Success. Review deleted.",
      data: {message: "Review has been deleted."}
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /products/:prod_id/review/:review_id
// Private / Admin
exports.deleteProductReviewComment = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id } = req.params;
  
  try {
    const findProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1;' [prod_id]
    );

    if (!findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    const findCommentReview = await pool.query(
      'SELECT * FROM comments WHERE product_id = $1 AND review_id = $2 AND user_id = $3;' [prod_id, review_id, id]
    );
      
    if (!findCommentReview) {
      return res.status(404).json({ errors: [{ msg: "Comment does not exist." }] });
    };

    const deleteProductReviewComments = await pool.query(
      'DELETE FROM comments WHERE review_id = $1 AND id = $1;' [review_id, id]
    );

    return res.status(200).json({
      status: "Success. Comment deleted.",
      data: {message: "Comment has been deleted."}
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};