const pool = require("../config/db");
// const cloudinary = require('cloudinary').v2;

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
    // TODO shange query for admin to get all users orders
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3;' [id, limit, offset]
    );

    res.status.json({
      status: "Success.",
      data: {
        orderItems: orders.rows[0],
        // orderTotalItems: orders.rowCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// logged in user orders / order history
// /orders/myorders
// Private
exports.getMyOrders = async (req, res, next) => {
  const { id } = req.user;
  const { pageNumber } = req.query;
  // create orders page pagination
  const page = Number(pageNumber) || 1;
  const threshHold = 1;
  const limit = 12 * threshHold;
  const offset = (page - 1) * limit;

  try {
    const orders = await pool.query(
      // 'SELECT * FROM orders WHERE id = $1 AND user_id = $2;' [order_id, id]
      // 'SELECT * FROM orders WHERE user_id = $1;' [id]
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3;' [id, limit, offset]
    );

    res.status(200).json({
      status: "Success. Orders found.",
      data: {
        userOrders: orders.rows
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// 
// /orders/:order_id
// Private
exports.getOrderById = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;

  try {
    const order = await pool.query(
      // 'SELECT * FROM orders WHERE id = $1;' [order_id]
      'SELECT P.*, OI.quantity FROM orders AS O JOIN order_items AS OI ON OI.order_id = O.id JOIN products AS P ON P.id = OI.product_id WHERE O.id = $1 AND O.user_id = $2;' [order_id, id]
    );

    if (!order) {
      return res.status(404).json({ errors: [{ msg: "Order not found." }] });
    }

    res.status(200).json({
      status: "Success. Order found.",
      data: {
        userOrder: order.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// Create new order
// /orders
// Private
exports.createOrder = async (req, res, next) => {
  const { id, cartID } = req.user;
  // const { subtotal, taxPrice, shippingPrice, totalPrice, stripePaymentId } = req.body;
  const { orderItemsList, shippingAddress, subtotal, taxPrice, shippingPrice, totalPrice, stripePaymentId } = req.body;

  try {
    // insert shipping information
    await pool.query(
      'INSERT INTO shipping_addresses (address) VALUES ($1) RETURNING *;' [shippingAddress]
    );

    // generate payment time
    const paidAtDate = new Date().toISOString().slice(0, 10);

    const order = await pool.query(
      'INSERT INTO orders (amount_subtotal, tax_price, shipping_price, total_price, is_paid, paid_at, stripe_payment_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *;', [subtotal, taxPrice, shippingPrice, totalPrice, true, paidAtDate, stripePaymentId, id]
    );

    if (!order) {
      return res.status(404).json({ errors: [{ msg: "Failed to create order / No order found." }] });
    };

    const orderID = order.rows[0].id;
    // orderITems are from the cart
    const cartItems = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1;' [cartID]
    );

    if (!cartItems) {
      return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
    }

    // const cartItemsID = cartItems.rows[0].id;
    const cartItemsProdID = cartItems.rows[0].product_id;
    const cartItemsQTY = cartItems.rows[0].quantity;

    const orderItems = await pool.query(
      'INSERT INTO order_items (quantity, order_id, product_id) VALUES ($1, $2, $3) Returning *;' [cartItemsQTY, orderID, cartItemsProdID]
    );

    // upon submission / processing of order, clear cart_items belonging to user
    await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1;' [cartID]
    );

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        createdOrder: order.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// POST - make order payment
// /orders/:order_id/payment
// Private
exports.orderPayment = async (req, res, next) => {
  const { email, amount } = req.body;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // let date = new Date();
  // date.toISOString();
  // example
  // let newCreatedAt = created_at.toISOString().slice(0, 10);
  try {
    return await stripe.paymentIntents.create({
      amount,
      // currency: "ngn",
      currency: "usd",
      payment_method_types: ["card"],
      receipt_email: email,
    });  
        // res.status(200).json({
        //   status: "Success. Order processed.",
        //   data: {
        //     createdOrder: order.rows[0]
        //   }
        // });
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// /orders/:order_id/pay
// Private / Admin
// TODO - may delete updateOrderToPaid
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


// /orders/:order_id/deliver
// Private/Admin
exports.updateOrderDeliveredStatus = async (req, res, next) => {
  const { id } = req.user;
  const { order_id } = req.params;
  try {
    const deliveredAtDate = new Date().toString();
    const order = await pool.query(
      'UPDATE orders SET is_delivered = $1, delivered_at = $2 WHERE id = $3 RETURNING *;' [true, deliveredAtDate, order_id]
    );
    
    if (!order) {
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