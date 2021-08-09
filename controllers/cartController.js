const pool = require("../config/db");

exports.getCart = async (req, res, next) => {
  // TODO -- -- calc subtotal, taxes, shipping price, total price frontend???
  const { id, cartID } = req.user;
  let cartSubtotal;
  let cartTaxes; // set to 0.11 ~ 11%
  let shippingCharge;
  let cartShippingPrice;
  let cartTotalPrice;
  
  try {
    // get user cart
    const userCart = await pool.query(
      // 'SELECT U.username, U.user_avatar, U.user_email, P.*, CI.quantity FROM users AS U JOIN cart AS C ON U.id = C.user_id JOIN cart_items AS CI ON C.id = CI.cart_id JOIN products AS P ON P.id = CI.product_id WHERE U.id = $1;' [id]
      'SELECT P.*, CI.quantity, CI.id AS cartItemID FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1;' [cartID]
      // 'SELECT P.*, CI.quantity, CI.id AS cartItemID FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.user_id = $1;' [id]
    );

    // TODO - calculate the subtotal of each individual item by its quantity and original price
    if (!userCart) {
      return res.status(404).json({ errors: [{ msg: "No cart found." }] });
    }

    // cartSubtotal = userCart.rows;
    
    cartSubtotal = userCart.rows.reduce((acc, item) => {
      return acc += Number(item.price) * Number(item.quantity);
    }, 0).toFixed(2);

    // console.log(cartSubtotal);
    cartTaxes = Number(cartSubtotal * 0.11).toFixed(2); // yax is 11%
    
    if (cartSubtotal < 50) {
      // additional flat rate
      shippingCharge = 3.00;
      cartShippingPrice = shippingCharge;
    }
    if (cartSubtotal > 50 && cartSubtotal < 100) {
      shippingCharge = 0.059; // 5.9%
      cartShippingPrice = (cartSubtotal * shippingCharge).toFixed(2);
    }
    if (cartSubtotal > 100) {
      shippingCharge = 0
      cartShippingPrice = shippingCharge;
    }
 
    cartTotalPrice = (Number(cartSubtotal) + Number(cartTaxes) + Number(cartShippingPrice)).toFixed(2); 
    // TODO - perhaps get user shipping address
    res.status(200).json({
      status: "Success.",
      data: {
        cartItems: userCart.rows,
        cartSubtotal: cartSubtotal,
        cartTaxes: cartTaxes,
        cartShippingPrice: cartShippingPrice,
        cartTotalPrice: cartTotalPrice
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

exports.addCartItem = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { product_id, quantity } = req.body;
  let cartSubtotal;
  let cartTaxes; // set to 0.11 ~ 11%
  let shippingCharge;
  let cartShippingPrice;
  let cartTotalPrice;
  try {
    // TODO - look up what ON CONFLICT command does
    const addToCart = await pool.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + 1 RETURNING *;' [cartID, product_id, quantity]
    );
    
    if (!addToCart) {
      return res.status(404).json({ errors: [{ msg: "No cart found." }] });
    };

    const updatedCartContent = await pool.query(
      'SELECT P.*, CI.quantity FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1;' [cartID]
    );

    cartSubtotal = updatedCartContent.rows.reduce((acc, item) => {
      return acc += Number(item.price) * Number(item.quantity);
    }, 0).toFixed(2);

    // console.log(cartSubtotal);
    // cartTaxes = Number(cartSubtotal * 0.11).toFixed(2); // yax is 11%
    
    // if (cartSubtotal < 50) {
    //   // additional flat rate
    //   shippingCharge = 3.00;
    //   cartShippingPrice = shippingCharge;
    // }
    // if (cartSubtotal > 50 && cartSubtotal < 100) {
    //   shippingCharge = 0.059; // 5.9%
    //   cartShippingPrice = (cartSubtotal * shippingCharge).toFixed(2);
    // }
    // if (cartSubtotal > 100) {
    //   shippingCharge = 0
    //   cartShippingPrice = shippingCharge;
    // }
 
    // cartTotalPrice = (Number(cartSubtotal) + Number(cartTaxes) + Number(cartShippingPrice)).toFixed(2);

    res.status(200).json({
      status: "Success. Order processed.",
      data: {
        // updatedAddedToCart: addToCart.rows[0]
        updatedCart: updatedCartContent.rows,
        cartSubtotal: cartSubtotal
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");  
  }
};

exports.updateCartQuantity = async (req, res, next) => {
  const { id, cartID } = req.user;
  const { product_id, quantity } = req.body;
  let cartSubtotal;
  let cartTaxes; // set to 0.11 ~ 11%
  let shippingCharge;
  let cartShippingPrice;
  let cartTotalPrice;
  try {
    const updateCartQuantity = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2;', [quantity, cartID]
    );

    if (!updateCartQuantity) {
      return res.status(404).json({ errors: [{ msg: "Failed to updatge cart." }] });
    }

    const updatedCartContent = await pool.query(
      'SELECT P.*, CI.quantity FROM cart_items AS CI JOIN products AS P ON CI.product_id = P.id WHERE CI.cart_id = $1;' [cartID]
    );

    cartSubtotal = updatedCartContent.rows.reduce((acc, item) => {
      return acc += Number(item.price) * Number(item.quantity);
    }, 0).toFixed(2);

    // TODO --- consider moving login for subtotal, taxes, and shipping cost to front end
    // console.log(cartSubtotal);
    // cartTaxes = Number(cartSubtotal * 0.11).toFixed(2); // yax is 11%
    
    // if (cartSubtotal < 50) {
    //   // additional flat rate
    //   shippingCharge = 3.00;
    //   cartShippingPrice = shippingCharge;
    // }
    // if (cartSubtotal > 50 && cartSubtotal < 100) {
    //   shippingCharge = 0.059; // 5.9%
    //   cartShippingPrice = (cartSubtotal * shippingCharge).toFixed(2);
    // }
    // if (cartSubtotal > 100) {
    //   shippingCharge = 0
    //   cartShippingPrice = shippingCharge;
    // }
 
    // cartTotalPrice = (Number(cartSubtotal) + Number(cartTaxes) + Number(cartShippingPrice)).toFixed(2);

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

// ==================================================

// utilizing for both options: req.user.cart_id and product_id via req.body
// considering implementing the following, but may work better front end usestate
// increment item quantity of cart_item by 1 join products by id
// then follow up with results query, cart_items, and products by their respective ids, calc subtotal, tax, shipping
// decrement item quantity of cart_item by 1 join products by id
// then follow up with results query, cart_items, and products by their respective ids, calc subtotal, tax, shipping