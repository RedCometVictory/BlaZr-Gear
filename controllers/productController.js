const pool = require("../config/db");
const cloudinary = require('cloudinary').v2;
const { removeOnErr } = require('../middleware/cloudinary');

exports.getProductIds = async (req, res, next) => {
  try {
    const productIds = await pool.query('SELECT id FROM products;');

    return res.status(200).json({
      status: "Product ids retrieved.",
      data: {
        productIds: productIds.rows,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await pool.query('SELECT DISTINCT(category) FROM products;');

    categories.rows.unshift({category: "All"});
    return res.status(200).json({
      status: "Category data retrieved.",
      data: {
        categories: categories.rows,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// Insomnia tested / Passed
// pagination required - get all products
// /products/:pageNumber
// Public
exports.getAllProducts = async (req, res, next) => {
  let { keyword, category, pageNumber, offsetItems } = req.query;
  let page = Number(pageNumber) || 1;
  let totalProducts;
  let products;
  let limit = Number(offsetItems) || 12;
  let offset = (page - 1) * limit;
  let count;

  try {
    const queryPromise = (query, ...values) => {
      return new Promise((resolve, reject) => {
        pool.query(query, values, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        });
      });
    }

    if (keyword.length > 0 && keyword !== 'null') {
      let keywordTrimmed = keyword.trim();
      if (category === '' || category === 'null' || !category) {
        totalProducts = await pool.query('SELECT COUNT(id) FROM products WHERE name ILIKE $1;', ['%' + keywordTrimmed + '%']);
        products = await pool.query(
          'SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.name ILIKE $1 GROUP BY I.id, P.id LIMIT $2 OFFSET $3;', ['%' + keywordTrimmed + '%', limit, offset]
        );
      }
      
      if (category && category.length > 0) {
        totalProducts = await pool.query('SELECT COUNT(id) FROM products WHERE name ILIKE $1 AND category = $2;', ['%' + keywordTrimmed + '%', category]);
        products = await pool.query(
          'SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.name ILIKE $1 AND category = $2 GROUP BY I.id, P.id LIMIT $3 OFFSET $4;', ['%' + keywordTrimmed + '%', category, limit, offset]
        );
      };
    }

    if (keyword === '' || keyword.length === 0 || !keyword) {
      if (category === '' || category === 'null' || !category) {
        totalProducts = await pool.query('SELECT COUNT(id) FROM products;');
        products = await pool.query(
          'SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id GROUP BY I.id, P.id LIMIT $1 OFFSET $2;', [limit, offset]
        );
      };
      
      if (category && category.length > 0) {
        totalProducts = await pool.query('SELECT COUNT(id) FROM products WHERE category = $1;', [category]);
        products = await pool.query(
          'SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.category = $1 GROUP BY I.id, P.id LIMIT $2 OFFSET $3;', [category, limit, offset]
        );
      };
    };

    count = totalProducts.rows[0].count;
    Number(count);

    if (products.rows.length > 0) {
      if (products.rowCount >= 1) {
        for (let i = 0; i < products.rows.length; i++) {
          let created_at = products.rows[i].created_at;
          let newCreatedAt = created_at.toISOString().slice(0, 10);
          products.rows[i].created_at = newCreatedAt;
        }
      };
      for (let i = 0; i < products.rows.length; i++) {
        const productReviewsQuery = 'SELECT TRUNC(AVG(rating), 2) AS review_avg, COUNT(rating) FROM reviews WHERE product_id = $1;';
        const productReviewsProm = await queryPromise(productReviewsQuery, products.rows[i].product_id);
        let productReviews = productReviewsProm.rows[0];
        products.rows[i] = { ...products.rows[i], ...productReviews };
      }
    }

    return res.status(200).json({
       status: "Product data retrieved.",
       data: {
         products: products.rows,
         page: page,
         pages: count
       }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// Insomnia tested / Passed / Works in App
// /products/:id
// Public
exports.getProductById = async (req, res, next) => {
  const { prod_id } = req.params;
  try {
    const product = await pool.query('SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.id = $1;', [prod_id]);

    if (product.rowCount === 0 || !product) {
      return res.status(404).json({ errors: [{ msg: "Product not found." }] });
    }

    if (product.rowCount > 0) {
      let created_at = product.rows[0].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      product.rows[0].created_at = newCreatedAt;
    };

    const productRating = await pool.query(
      'SELECT TRUNC(AVG(rating), 2) AS review, COUNT(rating) FROM reviews WHERE product_id = $1 GROUP BY product_id;', [product.rows[0].product_id]
    );

    const productReviews = await pool.query(
      'SELECT U.username, R.* FROM reviews AS R JOIN users AS U ON U.id = R.user_id where R.product_id = $1 ORDER BY R.created_at DESC;', [product.rows[0].product_id]
    );

    if (productReviews.rowCount >= 1) {
      for (let i = 0; i < productReviews.rows.length; i++) {
        let created_at = productReviews.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        productReviews.rows[i].created_at = newCreatedAt;
      }
    }

    return res.status(200).json({
      status: "Success.",
      data: {
        productInfo: product.rows[0],
        productRating: productRating.rows[0],
        productReviews: productReviews.rows
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

//  Insomnia tested / Passed
// /products/top
// Public
// show top rated products by highest rated average
exports.getTopProducts = async (req, res, next) => {
  try {
    const products = await pool.query(
      'SELECT P.*, I.*, TRUNC(AVG(R.rating), 2) AS review_avg, COUNT(R.*) FROM products AS P JOIN images AS I ON P.id = I.product_id JOIN reviews AS R ON P.id = R.product_id GROUP BY I.id, P.id ORDER BY review_avg DESC LIMIT 12;'
    );

    return res.status(200).json({
      status: "Success.",
      data: { topProducts: products.rows }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed / Works in App
// /products
// Private / Admin
exports.createProduct = async (req, res, next) => {
  const { name, brand, category, description, price, count_in_stock } = req.body;
  
  let productImgUrl = '';
  let productImgFilename = '';

  try {
    if (!name || !brand || !category || !description || !price || !count_in_stock) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(401).json({ errors: [{ msg: 'All fields are required.' }] });
    };

    if (name.length > 110) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Name is too long." }] });
    };

    if (brand.length > 255) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Brand is too long." }] });
    };

    if (count_in_stock === 0 || count_in_stock === '0') {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Count in stock must be at least 1 or more." }] });
    };

    if (price.startsWith("-")) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Price number cannot be negative." }] });
    };

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
      'INSERT INTO products (name, brand, category, description, price, count_in_stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', [name, brand, category, description, price, count_in_stock]
    );

    if (product.rowCount > 0) {
      let created_at = product.rows[0].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      product.rows[0].created_at = newCreatedAt;
    };

    let prodId = product.rows[0].id;

    const productImage = await pool.query(
      'INSERT INTO images (product_image_url, product_image_filename, product_id) VALUES ($1, $2, $3) RETURNING *;', [productImgUrl, productImgFilename, prodId]
    );

    let createdProduct = {...product.rows[0], ...productImage.rows[0] };

    return res.status(200).json({
      status: "Success. Product created.",
      data: { createdProduct }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed / Works in App
// /products/:prod_id/reviews
// Private
exports.createProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id } = req.params;
  const { title, description, rating } = req.body;
  Number(rating);

  try {
    if (!description) {
      return res.status(401).json({ errors: [{ msg: 'Description field is required.' }] });
    };

    if (title.length > 120) {
      return res.status(403).json({ errors: [{ msg: "Title is too long." }] });
    };

    const productExists = await pool.query('SELECT * FROM products WHERE id = $1;', [prod_id]);

    if (productExists.rowCount === 0 || !productExists) {
      return res.status(400).json({ errors: [{ msg: "Product does not exist." }] });
    };

    // check if user has not already reviewed the product
    const reviewExists = await pool.query('SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2;', [id, prod_id]);

    if (reviewExists.rowCount !== 0) {
      return res.status(400).json({ errors: [{ msg: "Unauthorized! User product review already exists." }] });
    };

    const userInfo = await pool.query('SELECT username FROM users WHERE id = $1;', [id]);

    if (userInfo.rowCount === 0 || !userInfo) {
      return res.status(404).json({ errors: [{ msg: "User does not exist." }] });
    };

    let username = userInfo.rows[0].username;
    // since rating is INT, number values with decimals cannot be inserted, numbers must be whole
    const createReview = await pool.query(
      'INSERT INTO reviews (title, description, rating, user_id, product_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [ title, description, rating, id, prod_id]
    );

    if (createReview.rowCount > 0) {
      let created_at = createReview.rows[0].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      createReview.rows[0].created_at = newCreatedAt;
    };

    return res.status(200).json({
      status: "Success! Product review created.",
      data: {
        review: {username, ...createReview.rows[0]}
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// /products/:prod_id/reviews/:review_id/comment
// Private / Admin / Staff?
exports.createProductReviewComment = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id } = req.params;
  const { title, description } = req.body;

  // TODO: check if admin already made comment on review, create ability to update admin comment on post, and give user ability to edit their original review and possibly respond c=back to the original admin comment to pusrue a conversation (though it may be good to prevent conversation from happening in order to keep the review page consise and consistent)
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1;' [prod_id]);

    if (!product) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND review_id = $2;' [prod_id, review_id]
    );
      
    if (!reviewExists) {
      return res.status(404).json({ errors: [{ msg: "Product review does not exist." }] });
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

// *** Insomnia tested / Passed / Works in App
// /products/:prod_id
// Private / Admin
exports.updateProduct = async (req, res, next) => {
  const { prod_id } = req.params;
  const { name, brand, category, description, price, count_in_stock } = req.body;

  let productImgUrl = '';
  let productImgFilename = '';
  let updateProduct;

  try {
    if (!name || !brand || !category || !description || !price || !count_in_stock) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(401).json({ errors: [{ msg: 'All fields are required.' }] });
    };
    
    if (name.length > 110) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Name is too long." }] });
    };
    
    if (brand.length > 255) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Brand is too long." }] });
    };

    // provided via multer cloudinary
    if (req.file && req.file.path) {
      productImgUrl = req.file.path;
      productImgFilename = req.file.filename;
    };

    // if using diskstorage multer
    if (productImgUrl.startsWith('dist\\')) {
      let editProductImgUrl = productImgUrl.slice(4);
      productImgUrl = editProductImgUrl;
    };

    const findProduct = await pool.query('SELECT * FROM products WHERE id = $1;', [prod_id]);
      
    if (findProduct.rowCount === 0 || !findProduct) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };

    // attempting to update the product, new img update
    if (productImgUrl !== '') {
      if (productImgFilename !== '') {
        let currProductImgFilename = await pool.query(
          'SELECT product_image_filename FROM images WHERE product_id = $1;', [prod_id]
        );

        if (currProductImgFilename.rows[0].product_image_filename) {
          await cloudinary.uploader.destroy(currProductImgFilename.rows[0].product_image_filename);
        }
      }

      // delete current image from cloud before update to db
      const updateProductWithImg = await pool.query(
        'UPDATE products SET name = $1, brand = $2, category = $3, description = $4, price = $5, count_in_stock = $6 WHERE id = $7;', [name, brand, category, description, price, count_in_stock, prod_id]
      );
      
      const updateImage = await pool.query(
        'UPDATE images SET product_image_url = $1, product_image_filename = $2 WHERE product_id = $3;', [productImgUrl, productImgFilename, prod_id]
      );

      updateProduct = await pool.query('SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.id = $1;', [prod_id]);
    }

    // updating product info, no new image
    if (productImgUrl === '') {
      let updateProductKeepImg = await pool.query(
        'UPDATE products SET name = $1, brand = $2, category = $3, description = $4, price = $5, count_in_stock = $6 WHERE id = $7;', [name, brand, category, description, price, count_in_stock, prod_id]
      );

      updateProduct = await pool.query('SELECT P.*, I.* FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.id = $1;', [prod_id]);
    }

    if (updateProduct.rowCount < 1) {
      return res.status(403).json({ errors: [{ msg: "Failed to update product." }] });
    }

    if (updateProduct.rowCount > 0) {
      let created_at = updateProduct.rows[0].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      updateProduct.rows[0].created_at = newCreatedAt;
    };    

    return res.status(200).json({
      status: "Success. Product updated.",
      data: {
        productInfo: {...updateProduct.rows[0] }
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed / Works in App
// /products/:prod_id/reviews/:review_id
// Private
exports.updateProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id } = req.params;
  const { title, description, rating } = req.body;

  try {
    if (title.length > 120) {
      return res.status(403).json({ errors: [{ msg: "Title is too long." }] });
    };

    if (!description) {
      return res.status(401).json({ errors: [{ msg: 'Description field is required.' }] });
    }

    const userInfo = await pool.query('SELECT username FROM users WHERE id = $1;', [id]);

    if (userInfo.rowCount === 0 || !userInfo) {
      return res.status(404).json({ errors: [{ msg: "User does not exist." }] });
    };

    const product = await pool.query('SELECT * FROM products WHERE id = $1;', [prod_id]);

    if (product.rowCount === 0 || !product) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query('SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2 AND id = $3;', [prod_id, id, review_id]);
      
    if (reviewExists.rowCount === 0 || !reviewExists) {
      return res.status(404).json({ errors: [{ msg: "Product review does not exist." }] });
    };

    let username = userInfo.rows[0].username;

    const updateReview = await pool.query(
      'UPDATE reviews SET title = $1, description = $2, rating = $3 WHERE product_id = $4 AND id = $5 RETURNING *;', [title, description, rating, prod_id, review_id]
    );

    if (updateReview.rowCount >= 1) {
      let created_at = updateReview.rows[0].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      updateReview.rows[0].created_at = newCreatedAt;
    };

    return res.status(200).json({
      status: "Success! Product review updated.",
      data: {
        updatedReview: {username, ...updateReview.rows[0]}
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// TODO --- this route may not be necessary
// /products/:prod_id/review/:review_id/comment/:comment_id
// Private / Admin / Staff?
exports.updateProductReviewComment = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id, comment_id } = req.params;
  const { title, description } = req.body;

  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1;' [prod_id]);

    if (!product) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    // check if user review still exists
    const reviewExists = await pool.query('SELECT * FROM reviews WHERE product_id = $1 AND id = $2;' [prod_id, review_id]);
      
    if (!reviewExists) {
      return res.status(404).json({ errors: [{ msg: "Product review does not exist." }] });
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

// *** Insomnia tested / Passed / Works in App
// /products/:prod_id
// Private / Admin
exports.deleteProduct = async (req, res, next) => {
  const { prod_id } = req.params;
  try {
    const findProduct = await pool.query('SELECT * FROM products WHERE id = $1;', [prod_id]);
    if (findProduct.rowCount === 0 || !findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    }

    // *** new products w/images table query ****
    // Consider not deleting product image from cloudinary in order to keep image in users' order history. Admin would have to delete image from cloudinary account via dashboard.
    // const findImage = await pool.query('SELECT * FROM images WHERE product_id = $1;', [prod_id]);

    // let currProdImgFilename = findImage.rows[0].product_image_filename;

    // if (currProdImgFilename) {
    //   await cloudinary.uploader.destroy(currProdImgFilename);
    // }

    // comments may not be implemented
    // const deleteProductReviewComments = await pool.query(
    //   'DELETE FROM comments WHERE product_id = $1;' [findProduct.rows[0].id]
    // );

    // delete Product Reviews
    await pool.query('DELETE FROM reviews WHERE product_id = $1;', [findProduct.rows[0].id]);

    // delete Product Cart Items
    await pool.query('DELETE FROM cart_items WHERE product_id = $1;', [findProduct.rows[0].id]);
    // const deleteProductOrderItems = await pool.query(
    //   'DELETE FROM order_items WHERE product_id = $1;', [findProduct.rows[0].id]
    // );

    // delete Product
    await pool.query('DELETE FROM products WHERE id = $1;', [prod_id]);

    return res.status(200).json({
      status: "Success. Product deleted.",
      data: {message: "This product has been deleted."}
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed / Works in App
// /products/:prod_id/reviews/:review_id
// Private
exports.deleteProductReview = async (req, res, next) => {
  const { id } = req.user;
  const { prod_id, review_id } = req.params;
  try {
    const findProduct = await pool.query(
      'SELECT * FROM products WHERE id = $1;', [prod_id]
    );

    if (findProduct.rowCount === 0 || !findProduct) {
      return res.status(404).json({ errors: [{ msg: "Product does not exist." }] });
    };
    
    const findProductReview = await pool.query(
      'SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2 AND id = $3;', [prod_id, id, review_id]
    );
      
    if (findProductReview.rowCount === 0 || !findProductReview) {
      return res.status(404).json({ errors: [{ msg: "Review does not exist." }] });
    };

    // TODO --- use only if user role is admin
    // const deleteProductReviewComments = await pool.query(
    //   'DELETE FROM comments WHERE review_id = $1;' [findProductReview.rows[0].id]
    // );

    const deleteProductReview = await pool.query(
      'DELETE FROM reviews WHERE id = $1;', [findProductReview.rows[0].id]
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

// TODO --- this route may not be necessary
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

    // delete Product Review Comments
    await pool.query(
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