const pool = require("../config/db");
const { calculateTotalAmount } = require('./paymentController');

// *** Insomnia tested / Passed
// Users get all their orders / order history for review
// /orders/my-orders
// Private
exports.getMyOrders = async (req, res, next) => {
  console.log("searching")
  const { id } = req.user;
  const { pageNumber } = req.query;
  // create orders page pagination
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;

  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3;', [id, limit, offset]
    );

    if (orders.rowCount === 0 || !orders) {
      return res.status(404).json({ errors: [{ msg: "You have not made any orders." }] });
    }

    res.status(200).json({
      status: "Success. User orders found.",
      data: {
        orderItems: orders.rows,
        // orderTotalItems: orders.rowCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// Admin, get all user orders / order history for review
// /orders
// Private / Admin
exports.getAllOrders = async (req, res, next) => {
  const { id } = req.user;
  const { pageNumber } = req.query;
  // create orders page pagination
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;

  try {
    const orders = await pool.query(
      'SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2;', [limit, offset]
    );

    //if rowcount 0, say no user orders exist
    res.status(200).json({
      status: "Success. Admin got all user orders for review.",
      data: {
        orderItems: orders.rows,
        // orderTotalItems: orders.rowCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// /orders/:order_id
// Private
exports.getOrderById = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  try {
    const order = await pool.query(
      // 'SELECT * FROM orders WHERE id = $1;' [order_id]
      // 'SELECT P.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, id]
      // *** new products w/images table query ****
      // TODO untested
      'SELECT O.*, P.*, I.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id JOIN images AS I ON I.product_id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, id]
    );

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Order not found." }] });
    }

    res.status(200).json({
      status: "Success. Order found.",
      data: {
        userOrder: order.rows
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed... did not implement stripeID yet
// Create new order
// /orders
// Private
exports.createOrder = async (req, res, next) => {
  const { id, cartID } = req.user;
  // const { orderItems, shippingAddress, paymentMethod, subtotal, taxPrice, shippingPrice, totalPrice, stripePaymentId } = req.body;
  // const { orderItems, subTotal, shippingPrice, taxPrice, totalPrice, shippingAddress, paymentInfo } = req.body;
  const { orderItems, shippingAddress, paymentInfo } = req.body;
  // think of as stripePaymentId;
  let order;
  let orderPaymentId;
  let orderPaymentStatus;
  let orderType;

  console.log("orderItems");
  console.log(orderItems);
  // TODO --- if stripe payment id is true set the payment method to 'stripe'
  if (orderItems.length === 0 || !shippingAddress || !paymentInfo || !id || !cartID) {
    return res.status(406).json({ errors: [{ msg: "All fields are required." }] });
  };
  orderPaymentId = paymentInfo.id;
  orderPaymentStatus = paymentInfo.status;
  orderType = paymentInfo.orderType;
  try {
    // const findUserAddress = await pool.query(
    //   'SELECT * FROM shipping_addresses WHERE user_id = $1;', [id]
    // );
    // if (findUserAddress.rowCount === 0 || !findUserAddress) {
    //    return res.status(404).json({ errors: [{ msg: "User address not found." }] });
    //  };
    // insert shipping information
    // await pool.query(
      // 'INSERT INTO shipping_addresses (address) VALUES ($1) RETURNING *;' [shippingAddress]
      // 'INSERT INTO shipping_addresses (address) VALUES ($1) RETURNING *;' [shippingAddress]
    // );

    let price = await calculateTotalAmount(orderItems);
    console.log("returned calculated price");
    console.log(price);
    const grandTotal = Math.round(price.grandTotal * 100);

    // generate payment time
    const paidAtDate = new Date().toISOString().slice(0, 10);

    if (orderType === "Stripe") {
      order = await pool.query(
        'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, stripe_payment_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;', [price.subTotal, price.tax, price.shippingTotal, price.grandTotal, true, paidAtDate, orderPaymentId, id]
      );
    }
    
    if (orderType === "PayPal") {
      order = await pool.query(
        'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, paypal_order_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;', [price.subTotal, price.tax, price.shippingTotal, price.grandTotal, true, paidAtDate, orderPaymentId, id]
      );
    }

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Failed to create order / No order found." }] });
    };

    const orderID = order.rows[0].id;
    // ^^^^^^^^^^^^^CART INFO^^^^^^^^^^^^^^^^^^^^^^^^
    // orderITems are from the cart
    // const cartItems = await pool.query(
      // 'SELECT * FROM cart_items WHERE cart_id = $1;' [cartID]
    // );
      
    // if (!cartItems) {
      //   return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
    // }

    // const cartItemsID = cartItems.rows[0].id;
    // const cartItemsProdID = cartItems.rows[0].product_id;
    // const cartItemsQTY = cartItems.rows[0].quantity;

    // console.log("inserting cart items into order items")
    
    // const orderItems = await pool.query(
    //   // 'INSERT INTO order_items (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;' [cartItemsQTY, orderID, cartItemsProdID]
    //   'INSERT INTO order_items (quantity, order_id, product_id) SELECT quantity, $1, product_id FROM cart_items WHERE cart_id = $2 RETURNING *;', [orderID, cartID]
    // );
    // ^^^^^^^^^^^^^CART INFO^^^^^^^^^^^^^^^^^^^^^^^^
    // TODO info from order items to pass: qty, order_id, name, price, image_id from images table using product_id as reference
    const queryPromise = (query, ...values) => {
      return new Promise((resolve, reject) => {
        pool.query(query, values, (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        })
      });
    };

    let cartToOrderItems = [];
    let orderItemsToDB = [];
    for (let i = 0; i < orderItems.length; i++) {
      const productImgQuery = 'SELECT P.id, P.price, P.name, P.count_in_stock, I.id FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.id = $1;';
      let orderItemsDB = await queryPromise(productImgQuery, orderItems[i].product.id);
      console.log('checking stock')
      if (orderItemsDB.rows[0].count_in_stock === 0) {
        return res.status(404).json({ errors: [{ msg: `${orderItemsDB.rows[0].name} not in stock. Please remove it from cart and checkout again.` }] });
      }
      console.log(`iteration ${i}:`)
      console.log(orderItemsDB.rows[0]);
      console.log(`ADDING QUANTITY TO PRODUCT`)
      orderItemsDB.rows[0].qty = orderItems[i].qty;
      console.log(orderItemsDB.rows[0]);
      // TODO place results into arry, spread oper for both loops
      cartToOrderItems.push(orderItemsDB.rows[i]);
    };
    
    console.log("orderItemsDB.rows");
    console.log(orderItemsDB.rows);
    console.log("===============================");
    console.log(cartToOrderItems);
    console.log("init inserting products into order items")

    for (let i = 0; i < orderItemsDB.rows.length; i++) {
      let name = cartToOrderItems[i].name;
      let quantity = cartToOrderItems[i].quantity;
      let price = cartToOrderItems[i].price;
      let productID = cartToOrderItems[i].price;
      let imageID = cartToOrderItems[i].price;

      const setOrderItemsDBQuery = 'INSERT INTO order_items (name, quantity, price, order_id, product_id, image_id) VALUES ($1, $2, $3, $4 $5, $6) RETURNING;'
      
      let setOrderItemsDB = await queryPromise(setOrderItemsDBQuery, [name, quantity, price, productID, orderID, imageID]);
      console.log('checking stock')
      console.log(`iteration ${i}:`);
      console.log(setOrderItemsDB.rows[0]);

      orderItemsToDB.push(setOrderItemsDB.rows[i])
    };
    console.log(`final reseult`)
    console.log(orderItemsToDB);

    // console.log("removing items from cart")
    // upon submission / processing of order, clear cart_items belonging to user
    // await pool.query(
    //   'DELETE FROM cart_items WHERE cart_id = $1;', [cartID]
    // );

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        // createdOrder: order.rows,
        // createdOrderItems: orderItems.rows
        createdOrder: cartToOrderItems,
        createdOrderItems: orderItemsToDB
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /orders/:order_id/pay
// Private
// TODO - may delete updateOrderToPaid
exports.updateOrderToPaid = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  // const { status, email, paymentMethod, stripePayID } = req.body;
  const { paymentMethod, stripePayID } = req.body;
  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1;', [order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    };

    const orderResult = order.rows[0];

    if (orderResult) {
      orderResult.paymentMethod = paymentMethod;
      orderResult.isPaid = true;
      orderResult.paidAt = Date.now();
      orderResult.stripe_payment_id = stripePayID;
      // orderResult.user_id = id;
    }
    
    const updateOrder = await pool.query(
      'UPDATE orders SET payment_method = $1, is_paid = $2, paid_at = $3, stripe_payment_id = $4 WHERE id = $5;', [orderResult.paymentMethod, orderResult.isPaid, orderResult.paidAt, orderResult.stripe_payment_id, id]
    );

    if (updateOrder.rowCount === 0 || !updateOrder) {
      return res.status(404).json({ errors: [{ msg: "Failed to update order." }] });
    };

    res.json({
      status: "Success",
      data: {
        // order: orderResult,
        order: updateOrder
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};
// exports.updateOrderToDelivered = async (req, res, next) => {
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id)

//   if (order) {
//     order.isPaid = true
//     order.paidAt = Date.now()
//     order.paymentResult = {
//       id: req.body.id,
//       status: req.body.status,
//       update_time: req.body.update_time,
//       email_address: req.body.payer.email_address,
//     }

//     const updatedOrder = await order.save()

//     res.json(updatedOrder)
//   } else {
//     res.status(404)
//     throw new Error('Order not found')
//   }
// })
// };

// *** Insomnia tested / Passed
// /orders/:order_id/deliver
// Private/Admin
exports.updateOrderDeliveredStatus = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  try {
    const deliveredAtDate = new Date().toString();
    const order = await pool.query(
      'UPDATE orders SET is_delivered = $1, delivered_at = $2 WHERE id = $3 RETURNING *;', [true, deliveredAtDate, order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    }
    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        updatedOrder: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};


// original ordercontroller

/*
const pool = require("../config/db");
// const cloudinary = require('cloudinary').v2;

// *** Insomnia tested / Passed
// Users get all their orders / order history for review
// /orders/my-orders
// Private
exports.getMyOrders = async (req, res, next) => {
  console.log("searching")
  const { id } = req.user;
  const { pageNumber } = req.query;
  // create orders page pagination
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;

  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3;', [id, limit, offset]
    );

    if (orders.rowCount === 0 || !orders) {
      return res.status(404).json({ errors: [{ msg: "You have not made any orders." }] });
    }

    res.status(200).json({
      status: "Success. User orders found.",
      data: {
        orderItems: orders.rows,
        // orderTotalItems: orders.rowCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// Admin, get all user orders / order history for review
// /orders
// Private / Admin
exports.getAllOrders = async (req, res, next) => {
  const { id } = req.user;
  const { pageNumber } = req.query;
  // create orders page pagination
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;

  try {
    const orders = await pool.query(
      'SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2;', [limit, offset]
    );

    //if rowcount 0, say no user orders exist
    res.status(200).json({
      status: "Success. Admin got all user orders for review.",
      data: {
        orderItems: orders.rows,
        // orderTotalItems: orders.rowCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// /orders/:order_id
// Private
exports.getOrderById = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  try {
    const order = await pool.query(
      // 'SELECT * FROM orders WHERE id = $1;' [order_id]
      // 'SELECT P.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, id]
      // *** new products w/images table query ****
      // TODO untested
      'SELECT O.*, P.*, I.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id JOIN images AS I ON I.product_id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, id]
    );

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Order not found." }] });
    }

    res.status(200).json({
      status: "Success. Order found.",
      data: {
        userOrder: order.rows
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed... did not implement stripeID yet
// Create new order
// /orders
// Private
exports.createOrder = async (req, res, next) => {
  const { id, cartID } = req.user;
  // const { subtotal, taxPrice, shippingPrice, totalPrice, stripePaymentId } = req.body;
  const { orderItemsList, shippingAddress, subtotal, taxPrice, shippingPrice, totalPrice } = req.body;

  // TODO --- if stripe payment id is true set the payment method to 'stripe'
  if (!subtotal || !taxPrice || !totalPrice || !cartID || !id) {
    return res.status(406).json({ errors: [{ msg: "All fields are required."}] });
  };
  // TODO --- consider removing stripepaymentid, derived from resulting stripe payment being processed, do not use during route testing
  try {
    // const findUserAddress = await pool.query(
    //   'SELECT * FROM shipping_addresses WHERE user_id = $1;', [id]
    // );
    // if (findUserAddress.rowCount === 0 || !findUserAddress) {
    //    return res.status(404).json({ errors: [{ msg: "User address not found." }] });
    //  };
    // insert shipping information
    // await pool.query(
      // 'INSERT INTO shipping_addresses (address) VALUES ($1) RETURNING *;' [shippingAddress]
      // 'INSERT INTO shipping_addresses (address) VALUES ($1) RETURNING *;' [shippingAddress]
    // );

    // generate payment time
    const paidAtDate = new Date().toISOString().slice(0, 10);

    const order = await pool.query(
      // 'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, stripe_payment_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *;', [subtotal, taxPrice, shippingPrice, totalPrice, true, paidAtDate, stripePaymentId, id]
      'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;', [subtotal, taxPrice, shippingPrice, totalPrice, true, paidAtDate, id]
    );

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Failed to create order / No order found." }] });
    };

    const orderID = order.rows[0].id;
    // orderITems are from the cart
    // const cartItems = await pool.query(
      // 'SELECT * FROM cart_items WHERE cart_id = $1;' [cartID]
    // );

    // if (!cartItems) {
    //   return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
    // }

    // const cartItemsID = cartItems.rows[0].id;
    // const cartItemsProdID = cartItems.rows[0].product_id;
    // const cartItemsQTY = cartItems.rows[0].quantity;

    // console.log("inserting cart items into order items")
    const orderItems = await pool.query(
      // 'INSERT INTO order_items (quantity, order_id, product_id) VALUES ($1, $2, $3) RETURNING *;' [cartItemsQTY, orderID, cartItemsProdID]
      'INSERT INTO order_items (quantity, order_id, product_id) SELECT quantity, $1, product_id FROM cart_items WHERE cart_id = $2 RETURNING *;', [orderID, cartID]
    );

    // console.log("removing items from cart")
    // upon submission / processing of order, clear cart_items belonging to user
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1;', [cartID]
    );

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        createdOrder: order.rows,
        createdOrderItems: orderItems.rows
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /orders/:order_id/pay
// Private
// TODO - may delete updateOrderToPaid
exports.updateOrderToPaid = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  // const { status, email, paymentMethod, stripePayID } = req.body;
  const { paymentMethod, stripePayID } = req.body;
  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1;', [order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    };

    const orderResult = order.rows[0];

    if (orderResult) {
      orderResult.paymentMethod = paymentMethod;
      orderResult.isPaid = true;
      orderResult.paidAt = Date.now();
      orderResult.stripe_payment_id = stripePayID;
      // orderResult.user_id = id;
    }
    
    const updateOrder = await pool.query(
      'UPDATE orders SET payment_method = $1, is_paid = $2, paid_at = $3, stripe_payment_id = $4 WHERE id = $5;', [orderResult.paymentMethod, orderResult.isPaid, orderResult.paidAt, orderResult.stripe_payment_id, id]
    );

    if (updateOrder.rowCount === 0 || !updateOrder) {
      return res.status(404).json({ errors: [{ msg: "Failed to update order." }] });
    };

    res.json({
      status: "Success",
      data: {
        // order: orderResult,
        order: updateOrder
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};
// exports.updateOrderToDelivered = async (req, res, next) => {
// const updateOrderToPaid = asyncHandler(async (req, res) => {
//   const order = await Order.findById(req.params.id)

//   if (order) {
//     order.isPaid = true
//     order.paidAt = Date.now()
//     order.paymentResult = {
//       id: req.body.id,
//       status: req.body.status,
//       update_time: req.body.update_time,
//       email_address: req.body.payer.email_address,
//     }

//     const updatedOrder = await order.save()

//     res.json(updatedOrder)
//   } else {
//     res.status(404)
//     throw new Error('Order not found')
//   }
// })
// };

// *** Insomnia tested / Passed
// /orders/:order_id/deliver
// Private/Admin
exports.updateOrderDeliveredStatus = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  try {
    const deliveredAtDate = new Date().toString();
    const order = await pool.query(
      'UPDATE orders SET is_delivered = $1, delivered_at = $2 WHERE id = $3 RETURNING *;', [true, deliveredAtDate, order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    }
    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        updatedOrder: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};
*/