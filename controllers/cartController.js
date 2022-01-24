const pool = require("../config/db");
// *** NOTE: originally cart info was saved to db. However it is handled in LS instead. This code is to be saved in case of change.
// *** Insomnia tested / Passed
// get all current user cart items, toling tax, shipping, and price without adding item to cart
// /cart
// Private
exports.getCart = async (req, res, next) => {
  const { id, cartID } = req.user;
  let cartSubtotal;
  let cartTaxes; // set to 0.11 ~ 11%
  let shippingCharge;
  let cartShippingPrice;
  let cartTotalPrice;
  
  try {
    const userCart = await pool.query(
      'SELECT C.id AS cart_id, C.user_id AS cartUserID, P.*, CI.quantity, CI.id AS cartItemID FROM carts AS C JOIN cart_items AS CI ON C.id = CI.cart_id JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1 AND C.user_id = $2;', [cartID, id]
    );

    if (userCart.rowCount === 0 || !userCart) {
      return res.status(404).json({ errors: [{ msg: "No cart items found." }] });
    }

    // cartSubtotal = userCart.rows;

    res.status(200).json({
      status: "Success.",
      data: {
        cartItems: userCart.rows
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// *** Insomnia tested / Passed
// /cart/add
// Private
exports.addCartItem = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { product_id, quantity } = req.body;
  try {
    const addToCart = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + 1 RETURNING *;', [cartID, product_id, quantity]
    );
    
    if (addToCart.rowCount === 0 || !addToCart) {
      return res.status(404).json({ errors: [{ msg: "No cart found." }] });
    };

    const updatedCartContent = await pool.query(
      'SELECT P.*, CI.quantity FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1;', [cartID]
    );

    cartSubtotal = updatedCartContent.rows.reduce((acc, item) => {
      return acc += Number(item.price) * Number(item.quantity);
    }, 0).toFixed(2);

    cartTaxes = Number(cartSubtotal * 0.11).toFixed(2); // tax is 11%
    
    if (cartSubtotal < 50) {
      shippingCharge = 3.00;
      cartShippingPrice = shippingCharge;
    }
    if (cartSubtotal > 50 && cartSubtotal < 100) {
      shippingCharge = 0.069; // 6.9%
      cartShippingPrice = (cartSubtotal * shippingCharge).toFixed(2);
    }
    if (cartSubtotal > 100) {
      shippingCharge = 0
      cartShippingPrice = shippingCharge;
    }
 
    cartTotalPrice = (Number(cartSubtotal) + Number(cartTaxes) + Number(cartShippingPrice)).toFixed(2);

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        updatedCart: updatedCartContent.rows,
        cartSubtotal: cartSubtotal,
        cartTaxes,
        cartShippingPrice,
        cartTotalPrice
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// *** Insomnia tested / Passed
// /cart/update-quantity
// Private
exports.updateCartQuantity = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { product_id, quantity } = req.body;
  let cartSubtotal;
  let cartTaxes; // set to 0.11 ~ 11%
  let shippingCharge;
  let cartShippingPrice;
  let cartTotalPrice;
  try {
    if (quantity == 0) {
      return res.status(401).json({ errors: [{ msg: "Warning: Quantity cannot be 0. Otherwise remove item from cart." }] });
    }

    const checkCartItemExists = await pool.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2;', [cartID, product_id]
    );

    if (checkCartItemExists.rowCount === 0 || !checkCartItemExists) {
      return res.status(404).json({ errors: [{ msg: "Cart item does not exist." }] });
    }

    const updateCartQuantity = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *;', [quantity, cartID, product_id]
    );

    if (updateCartQuantity.rowCount === 0 || !updateCartQuantity) {
      return res.status(404).json({ errors: [{ msg: "Failed to update cart." }] });
    }

    const updatedCartContent = await pool.query(
      'SELECT P.*, CI.quantity FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1;', [cartID]
    );

    cartSubtotal = updatedCartContent.rows.reduce((acc, item) => {
      return acc += Number(item.price) * Number(item.quantity);
    }, 0).toFixed(2);

    cartTaxes = Number(cartSubtotal * 0.11).toFixed(2); // tax is 11%
    
    if (cartSubtotal < 50) {
      // additional flat rate
      shippingCharge = 3.00;
      cartShippingPrice = shippingCharge;
    }
    if (cartSubtotal > 50 && cartSubtotal < 100) {
      shippingCharge = 0.069; // 5.9%
      cartShippingPrice = (cartSubtotal * shippingCharge).toFixed(2);
    }
    if (cartSubtotal > 100) {
      shippingCharge = 0
      cartShippingPrice = shippingCharge;
    }
 
    cartTotalPrice = (Number(cartSubtotal) + Number(cartTaxes) + Number(cartShippingPrice)).toFixed(2);

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        updatedOrder: updatedCartContent.rows,
        cartSubtotal: cartSubtotal,
        cartTaxes,
        cartShippingPrice,
        cartTotalPrice
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

// *** Insomnia tested / Passed
// /cart/delete
// Private
exports.deleteCartItem = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { product_id } = req.body;

  try {
    // delete item from cart entirely, regardless of quantity
    const deleteFromCart = await pool.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *;', [cartID, product_id]
    );

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        deletedOrder: deleteFromCart.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};