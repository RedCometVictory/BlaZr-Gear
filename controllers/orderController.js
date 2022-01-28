const pool = require("../config/db");
const { orderConfirmationMail } = require("../middleware/emailService");

// *** Tested / Works in App
const calculateTotalAmount = async (cartItems) => {
  if (cartItems.length === 0) {
    return ['error', `cartItems length is ${cartItems.length}. Please add items to cart to proceed with an order.`];
  };

  try {
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

    let cartItemProdIds = []
    for (let i = 0; i < cartItems.length; i++) {
      cartItemProdIds.push(cartItems[i].product.product_id);
    }

    let prodItems = [];
    let serverProdPayItems = [];
    for (let i = 0; i < cartItemProdIds.length; i++) {
      const productFromCart = 'SELECT id, price, name, count_in_stock FROM products WHERE id = $1;';

      const productConfirm = await queryPromise(productFromCart, cartItemProdIds[i]);
      prodItems = productConfirm.rows[0];
      serverProdPayItems[i] = {...serverProdPayItems[i], ...prodItems};
    };
    
    for (let i = 0; i < serverProdPayItems.length; i++) {
      // TODO: consider changing to how it is set up in payment controller
      if (serverProdPayItems[i].count_in_stock === 0) {
        return ['error', `${serverProdPayItems[i].name} not in stock. Please remove it from cart and checkout again.`]
      }
      serverProdPayItems[i].qty = cartItems[i].qty;
    };

    let price = {};
    price.subTotal = serverProdPayItems.reduce((acc, item) => acc += item.price * item.qty, 0).toFixed(2);
    price.tax = Number(price.subTotal * 0.11).toFixed(2);
    price.shippingTotal = 
      price.subTotal < 50 && price.subTotal > 0.01 ? (
        3.00
      ) : price.subTotal > 50 && price.subTotal < 100 ? (
        Number(price.subTotal * 0.069).toFixed(2)
      ) : (
        0
      );
    price.grandTotal = (Number(price.subTotal) + Number(price.tax) + Number(price.shippingTotal)).toFixed(2);
    return price;
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Tested / Insomnia tested - passed/ Works in App
// Users get all their orders / order history for review
// /orders/my-orders
// Private
exports.getMyOrders = async (req, res, next) => {
  const { id } = req.user;
  const { pageNumber, offsetItems } = req.query;
  let page = Number(pageNumber) || 1;
  if (page < 1) page = 1;
  const limit = Number(offsetItems) || 12;
  const offset = (page - 1) * limit;
  let totalOrders;
  let count;

  try {
    totalOrders = await pool.query(
      'SELECT COUNT(id) FROM orders WHERE user_id = $1;', [id]
    );

    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;', [id, limit, offset]
    );

    if (orders.rowCount === 0 || !orders) {
      return res.status(404).json({ errors: [{ msg: "You have not made any orders." }] });
    }

    count = totalOrders.rows[0].count;

    res.status(200).json({
      status: "Success. User orders found.",
      data: {
        orderItems: orders.rows,
        page: page,
        pages: count
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Tested /  Insomnia tested - Passed / Works in App
// Admin, get all user orders / order history for review
// /orders
// Private / Admin
exports.getAllOrders = async (req, res, next) => {
  const { pageNumber, offsetItems } = req.query;
  const page = Number(pageNumber) || 1;
  const limit = Number(offsetItems) || 12;
  const offset = (page - 1) * limit;
  let allOrdersCount;
  let count;

  try {
    allOrdersCount = await pool.query(
      'SELECT COUNT(*) FROM orders;'
    );

    const orders = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2;', [limit, offset]
    );

    count = allOrdersCount.rows[0].count;

    res.status(200).json({
      status: "Success. Admin got all user orders for review.",
      data: {
        orderItems: orders.rows,
        page: page,
        pages: count
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Tested / Insomnia tested - Passed / Works in App
// /orders/:order_id
// Private
exports.getOrderById = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;

  try {
    const order = await pool.query(
      'SELECT O.*, P.*, I.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id JOIN images AS I ON I.product_id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, id]
    );

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Order not found." }] });
    }
    
    if (order.rowCount >= 1) {
      for (let i = 0; i < order.rows.length; i++) {
        let created_at = order.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        order.rows[i].created_at = newCreatedAt;
      }
    };

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

// *** Tested / Insomnia tested - Passed / Works in App
// /orders/:order_id
// admin
exports.getOrderByIdAdmin = async (req, res, next) => {
  const { order_id } = req.params;

  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE id = $1;', [order_id]
    );
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Order not found." }] });
    }

    if (order.rowCount >= 1) {
      for (let i = 0; i < order.rows.length; i++) {
        let created_at = order.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        order.rows[i].created_at = newCreatedAt;
      }
    };

    let orderUserId = order.rows[0].user_id;
    
    let orderItems = await pool.query(
      'SELECT O.id, P.*, I.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id JOIN images AS I ON I.product_id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;', [order_id, orderUserId]
    );

    if (orderItems.rowCount >= 1) {
      for (let i = 0; i < orderItems.rows.length; i++) {
        let created_at = orderItems.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        orderItems.rows[i].created_at = newCreatedAt;
      }
    };
    
    let userInfo;
    let userId = order.rows[0].user_id;
    let userInfoQuery = await pool.query(
      'SELECT id, f_name, l_name, user_email, role, stripe_cust_id FROM users WHERE id = $1;', [userId]
    );

    userInfo = userInfoQuery.rows[0];

    res.status(200).json({
      status: "Success. Order found.",
      data: {
        userOrder: { orderInfo: order.rows[0], orderItems: orderItems.rows, userInfo }
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Tested / Insomnia tested - Passed / Works in App
// Create new order
// POST /orders
// Private
exports.createOrder = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { orderItems, shippingAddress, paymentInfo } = req.body;

  let order;
  let orderPaymentId;
  let orderCaptureId = '';
  // let orderPaymentStatus;
  let orderType;

  if (orderItems.length === 0 || !shippingAddress || !paymentInfo || !id || !cartID) {
    return res.status(406).json({ errors: [{ msg: "All fields are required." }] });
  };

  orderPaymentId = paymentInfo.id;
  if (paymentInfo.captureId) {
    orderCaptureId = paymentInfo.captureId;
  };
  // orderPaymentStatus = paymentInfo.status;
  orderType = paymentInfo.orderType;

  try {
    let price = await calculateTotalAmount(orderItems);
    if (price.length > 1 && price[0] === 'error') {
      return res.status(404).json({ errors: [{ msg: `${price[1]}` }] });
    }
    // generate payment time
    const paidAtDate = new Date().toISOString().slice(0, 10);

    if (orderType === "Stripe") {
      order = await pool.query(
        'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, order_status, stripe_payment_id, payment_method, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;', [price.subTotal, price.tax, price.shippingTotal, price.grandTotal, true, paidAtDate, 'processing', orderPaymentId, orderType, id]
      );
    }
    
    if (orderType === "PayPal") {
      order = await pool.query(
        'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, order_status, paypal_order_id, paypal_capture_id, payment_method, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;', [price.subTotal, price.tax, price.shippingTotal, price.grandTotal, true, paidAtDate, 'processing', orderPaymentId, orderCaptureId, orderType, id]
      );
    }

    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "Failed to create order / No order found." }] });
    };

    const orderID = order.rows[0].id;

    if (shippingAddress.lat === '' || !shippingAddress.lat) shippingAddress.lat = 0.0;
    if (shippingAddress.lng === '' || !shippingAddress.lng) shippingAddress.lng = 0.0;
    // order Shipping Info
    await pool.query(
      'INSERT INTO shipping_addresses (address, city, postal_code, state, country, lat, lng, order_id, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);', [shippingAddress.address, shippingAddress.city, shippingAddress.zipcode, shippingAddress.state, shippingAddress.country, shippingAddress.lat, shippingAddress.lng, orderID, id]
    );

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

    let orderItemsDB = [];
    let cartToOrderItems = [];
    for (let i = 0; i < orderItems.length; i++) {
      const productImgQuery = 'SELECT P.id AS product_id, P.price, P.name, P.count_in_stock, I.id FROM products AS P JOIN images AS I ON P.id = I.product_id WHERE P.id = $1;';
      // let orderItemsDB = await queryPromise(productImgQuery, orderItems[i].product.product_id);
      let orderItemsConfirm = await queryPromise(productImgQuery, orderItems[i].product.product_id);
      orderItemsDB = orderItemsConfirm.rows[0];
      cartToOrderItems[i] = {...cartToOrderItems[i], ...orderItemsDB};
    };

    for (let i = 0; i < cartToOrderItems.length; i++) {
      if (cartToOrderItems[i].count_in_stock === 0) {
        return res.status(404).json({ errors: [{ msg: `${cartToOrderItems[i].product.name} not in stock. Please remove it from cart and checkout again.` }] });
      }
    };

    for (let i = 0; i < orderItems.length; i++) {
      const productStockQuery = 'UPDATE products SET count_in_stock = $1 WHERE id = $2 RETURNING id, name, count_in_stock;';
      let currentStockQuantity = cartToOrderItems[i].count_in_stock;
      let purchasedQuantity = orderItems[i].qty;
      let updatedStockQuantity;

      updatedStockQuantity = currentStockQuantity - purchasedQuantity;
      if (updatedStockQuantity < 0) {
        return res.status(404).json({ errors: [{ msg: `An error occurred. The product may be out of stock.` }] });
      }

      // updated Product Stock
      await queryPromise(
        productStockQuery, updatedStockQuantity, cartToOrderItems[i].product_id
      );
    }

    let itemOrdered = [];
    let orderItemsToDB = [];
    for (let i = 0; i < cartToOrderItems.length; i++) {
      let name = cartToOrderItems[i].name;
      let quantity = cartToOrderItems[i].count_in_stock;
      let price = cartToOrderItems[i].price;
      let productID = cartToOrderItems[i].product_id;
      let imageID = cartToOrderItems[i].id;

      const setOrderItemsDBQuery = 'INSERT INTO order_items (name, quantity, price, order_id, product_id, image_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;'
      
      let setOrderItemsDB = await queryPromise(setOrderItemsDBQuery, name, quantity, price, orderID, productID, imageID);
      itemOrdered = setOrderItemsDB.rows[0];

      orderItemsToDB[i] = {...orderItemsToDB[i], ...itemOrdered};
    };

    let userEmail = await pool.query(
      'SELECT f_name, user_email FROM users WHERE id = $1;', [id]
    );
    let firstName = userEmail.rows[0].f_name;
    let email = userEmail.rows[0].user_email;
    await orderConfirmationMail(email, orderID,firstName);
    // upon submission / processing of order, clear cart_items belonging to user
    // await pool.query(
    //   'DELETE FROM cart_items WHERE cart_id = $1;', [cartID]
    // );

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
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
// Admin
// TODO - may delete updateOrderToPaid
// order statuses: ['processing', 'shipped', 'delivered', 'refunded', 'lost', 'unknown']
exports.updateOrderToPaid = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
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
    }
    
    const updateOrder = await pool.query(
      'UPDATE orders SET payment_method = $1, is_paid = $2, paid_at = $3, stripe_payment_id = $4 WHERE id = $5;', [orderResult.paymentMethod, orderResult.isPaid, orderResult.paidAt, orderResult.stripe_payment_id, id]
    );

    if (updateOrder.rowCount === 0 || !updateOrder) {
      return res.status(404).json({ errors: [{ msg: "Failed to update order." }] });
    };

    res.status(200).json({
      status: "Success",
      data: {
        order: updateOrder
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// /orders/:order_id/status-to-shipped
// Private/Admin
exports.updateOrderToShipped = async (req, res, next) => {
  const { order_id } = req.params;
  try {
    const order = await pool.query(
      'UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *;', ['shipped', order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    }
    res.status(200).json({
      status: "Success. Order processed.",
      //  userOrder: { orderInfo: order.rows[0], orderItems: orderItems.rows, userInfo }
      data: {
        orderInfo: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// /orders/:order_id/deliver
// Private/Admin
exports.updateOrderDeliveredStatus = async (req, res, next) => {
  const { order_id } = req.params;
  try {
    const deliveredAtDate = new Date().toString().slice(0, 10);
    const order = await pool.query(
      'UPDATE orders SET is_delivered = $1, delivered_at = $2, order_status = $3 WHERE id = $4 RETURNING *;', [true, deliveredAtDate, 'delivered', order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    }
    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        orderInfo: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// /orders/:order_id/refund
// Private/Admin
exports.updateOrderRefund = async (req, res, next) => {
  const { order_id } = req.params;
  try {
    const refundedAtDate = new Date().toString().slice(0, 10);
    const order = await pool.query(
      'UPDATE orders SET is_refunded = $1, refunded_at = $2, order_status = $3 WHERE id = $4 RETURNING *;', [true, refundedAtDate, 'refunded', order_id]
    );
    
    if (order.rowCount === 0 || !order) {
      return res.status(404).json({ errors: [{ msg: "No order found." }] });
    }
    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        orderInfo: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Tested /  Insomnia tested - Passed / Works in App
// /orders/:order_id/remove
// Private/Admin
exports.deleteOrder = async (req, res, next) => {
  const { order_id } = req.params;
  try {
    const findOrder = await pool.query(
      'SELECT * FROM orders WHERE id = $1;', [order_id]
    );

    if (findOrder.rowCount === 0 || !findOrder) {
      return res.status(404).json({ errors: [{ msg: "Order does not exist. "}] });
    };

    await pool.query(
      'DELETE FROM order_items WHERE order_id = $1;', [order_id]
    );

    await pool.query(
      'DELETE FROM shipping_addresses WHERE order_id = $1;', [order_id]
    );

    await pool.query(
      'DELETE FROM orders WHERE id = $1;', [order_id]
    );

    res.status(200).json({
      status: "Success. Order deleted.",
      data: { message: "Order has been deleted." }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};