-- create database then select it in psql terminal...
-- apply middleware right after the creation of the database
-- takes time to create db and uuid-oosp
-- \c <database> name to select database to work with
-- \l list all databases
-- \dt show all tables in current selected database
-- \d <table name> show details of columns that make up a table, must first select a database

-- UPDATE HISTORY:
-- Created new images table in order to keep data independent of products table and order_items table. This way images can be updated or deleted independently via Admin and are also safe from deletion if the Admin decides to delete a product from the porduct table or if a customer deletes and order (and subsequent order_items)) containing such image. This way the image is preserved for other customers' order histories (in the best possible manner I can think of).

-- can be skipped if db already created via heroku cli
-- CREATE DATABASE blazr_gear;
-- CREATE DATABASE blazr_gear_ver_02;

-- Check the syntax of a query, if passed returns: DO:
-- DO $SYNTAX_CHECK$ BEGIN RETURN;
-- query goes here
-- END; $SYNTAX_CHECK$;

-- DO $SYNTAX_CHECK$ BEGIN RETURN;
-- CREATE TABLE shipping_addresses(
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   address VARCHAR(255) NOT NULL,
--   city VARCHAR(255) NOT NULL,
--   postal_code VARCHAR(255) NOT NULL,
--   country VARCHAR(255) NOT NULL,
--   order_id UUID,
--   user_id UUID,
--   FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
-- END; $SYNTAX_CHECK$;

-- EXAMPLE ADMIN QUERY
-- INSERT INTO users (f_name, l_name, username, user_email, user_password, user_avatar, user_avatar_filename, admin) VALUES (first, here, HauseMaster, thehausewins@mail.com, , , , true); 

-- ALTER TABLE table_name
-- ADD COLUMN new_column_name data_type constraint;


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  f_name VARCHAR(60) NOT NULL,
  l_name VARCHAR(60) NOT NULL,
  username VARCHAR(120) NOT NULL UNIQUE,
  user_email VARCHAR(60) NOT NULL UNIQUE,
  user_password VARCHAR(660) NOT NULL,
  -- user_avatar VARCHAR(300),
  -- user_avatar_filename VARCHAR(600),
  refresh_token TEXT,
  stripe_cust_id VARCHAR(180),
  role VARCHAR(10) NOT NULL DEFAULT 'visitor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reset_tokens(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_address VARCHAR(60) NOT NULL,
  reset_token VARCHAR(660) NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(120),
  address_2 VARCHAR(120),
  phone VARCHAR(22),
  city VARCHAR(120),
  state VARCHAR(120),
  country VARCHAR(120),
  zipcode VARCHAR(10),
  -- gender VARCHAR(50),
  -- birth_date DATE,
  company VARCHAR(255),
  -- status VARCHAR(255),
  -- interests TEXT,
  -- bio VARCHAR(360),
  -- background_image VARCHAR(300),
  -- background_image_filename VARCHAR(600),
  user_id UUID,
  FOREIGN KEY(user_id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ############################################################
-- cart schema

CREATE TABLE carts(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  FOREIGN KEY(user_id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- create porducts table first
CREATE TABLE cart_items(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quantity INT NOT NULL,
  cart_id UUID NOT NULL, -- perhaps add UNIQUE
  product_id UUID NOT NULL, -- perhaps add UNIQUE
  FOREIGN KEY(cart_id) REFERENCES carts(id),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- altering table columns, making them NOT NULL
-- ALTER TABLE cart_items ALTER COLUMN cart_id SET NOT NULL, ALTER COLUMN product_id SET NOT NULL;
-- altering table columns, making them UNIQUE
-- ALTER TABLE cart_items ADD UNIQUE (cart_id, product_id);

-- ############################################################
-- product schema
CREATE TABLE products(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  -- product_image_url VARCHAR(320) NOT NULL,
  -- product_image_filename VARCHAR(320) NOT NULL,
  brand VARCHAR(255) NOT NULL DEFAULT 'N/A',
  category TEXT NOT NULL DEFAULT 'N/A',
  description TEXT NOT NULL,
  -- include total reviews of product as a number
  -- rating INT NOT NULL DEFAULT 0,
  price NUMERIC(6,2) NOT NULL DEFAULT 0,
  count_in_stock INT NOT NULL DEFAULT 0,
  -- user_id UUID,
  -- review_id UUID,
  -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ALTER TABLE images DROP CONSTRAINT images_product_id_fkey;

-- update or delete on table "products" violates foreign key constraint "images_product_id_fkey" on table "images"
-- potential fix, apply via psql terminal, keepimg image is to preserve user order history, unless vulgar its deleted

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_image_url VARCHAR(320) NOT NULL,
  product_image_filename VARCHAR(320) NOT NULL,
  product_id UUID,
  -- FOREIGN KEY (order_id) REFERENCES orders(id),
  -- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(120),
  image_url VARCHAR(320) NOT NULL,
  image_filename VARCHAR(320) NOT NULL,
  description TEXT,
  theme TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- DROP TABLE IF EXISTS products;

-- CREATE TABLE products (
  -- id SERIAL PRIMARY KEY,
  -- name VARCHAR(100) NOT NULL,
  -- price NUMERIC(5,2)
-- );

-- ############################################################
CREATE TABLE reviews(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(120),
  description TEXT,
  rating INT NOT NULL DEFAULT 0,
  user_id UUID,
  product_id UUID,
  -- comment_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  -- FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(120),
  description TEXT NOT NULL,
  user_id UUID,
  review_id UUID,
  product_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ############################################################
  -- order_items_id UUID,
  -- FOREIGN KEY (order_items_id) REFERENCES users(id) ON DELETE CASCADE
  -- alter table orders alter column tax_price type numeric(6, 2);
  -- consider adding a order status column to reflect processing status as 'shipped, processing, refunded, or delivered
  -- if delivered_at is null, then order is 'shipped or processing'
CREATE TABLE orders(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_method VARCHAR(360),
  amount_subtotal NUMERIC(6,2) NOT NULL DEFAULT 0.0,
  tax_price NUMERIC (6,2) NOT NULL DEFAULT 0.0,
  shipping_price NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  total_price NUMERIC(7,2) NOT NULL DEFAULT 0.0,
  -- total_price NUMERIC(8,2) NOT NULL DEFAULT 0.0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at VARCHAR(120),
  is_delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at VARCHAR(120),
  is_refunded BOOLEAN NOT NULL DEFAULT false,
  refunded_at VARCHAR(120),
  order_status VARCHAR(100),
  stripe_payment_id VARCHAR(140),
  paypal_order_id VARCHAR(140),
  paypal_capture_id VARCHAR(140),
  user_id UUID,
  -- payment_result_id UUID,
  -- shipping_address_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- FOREIGN KEY (payment_result_id) REFERENCES payment_results(id) ON DELETE CASCADE,
  -- FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  -- image_url VARCHAR(320) NOT NULL,
  -- image_url_filename VARCHAR(600) NOT NULL,
  price NUMERIC(6,2) NOT NULL,
  order_id UUID,
  product_id UUID,
  image_id UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  -- FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (image_id) REFERENCES images(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipping_addresses(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  lat NUMERIC(20,16) NOT NULL DEFAULT 0.0,
  lng NUMERIC(20,16) NOT NULL DEFAULT 0.0,
  order_id UUID,
  user_id UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- may just be a column on orders table
-- CREATE TABLE payment_results(
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   -- status VARCHAR(255),
--   -- email_address VARCHAR(255),
--   stripe_payment_id VARCHAR(100),
--   order_id UUID,
--   FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- include an order number for orders table that connects to payment results (pay res FK to order num in the orders table?)