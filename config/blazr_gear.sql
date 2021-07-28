-- create database then select it in psql terminal...
-- apply middleware right after the creation of the database
-- takes time to create db and uuid-oosp
-- \c <database> name to select database to work with
-- \l list all databases
-- \dt show all tables in current selected database

-- can be skipped if db already created via heroku cli
-- CREATE DATABASE blazr-gear;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  f_name VARCHAR(60) NOT NULL,
  l_name VARCHAR(60) NOT NULL,
  username VARCHAR(120) NOT NULL UNIQUE,
  user_email VARCHAR(60) NOT NULL UNIQUE,
  user_password VARCHAR(60) NOT NULL,
  user_avatar VARCHAR(300),
  user_avatar_filename VARCHAR(600),
  refresh_token TEXT,
  isAdmin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(120),
  address_2 VARCHAR(120),
  city VARCHAR(120),
  state VARCHAR(120),
  country VARCHAR(120),
  zipcode VARCHAR(10),
  gender VARCHAR(50),
  birth_date DATE,
  company VARCHAR(255),
  status VARCHAR(255),
  interests TEXT,
  bio VARCHAR(360),
  background_image VARCHAR(300),
  background_image_filename VARCHAR(600),
  user_id UUID,
  FOREIGN KEY(user_id) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ############################################################
-- product schema
CREATE TABLE products(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  product_image_url VARCHAR(320) NOT NULL,
  product_image_filename VARCHAR(320) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  -- include total reviews of product as a number
  rating INT NOT NULL DEFAULT 0,
  price INT NOT NULL DEFAULT 0,
  count_in_stock INT NOT NULL DEFAULT 0,
  user_id UUID,
  review_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ############################################################
CREATE TABLE reviews(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rating INT NOT NULL,
  user_id UUID,
  -- comment_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  user_id UUID,
  review_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- ############################################################
  -- order_items_id UUID,
  -- FOREIGN KEY (order_items_id) REFERENCES users(id) ON DELETE CASCADE
CREATE TABLE orders(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_method VARCHAR(255) NOT NULL,
  tax_price INT NOT NULL DEFAULT 0.0,
  shipping_price INT NOT NULL DEFAULT 0.0,
  total_price INT NOT NULL DEFAULT 0.0,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at DATE,
  is_delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at DATE,
  user_id UUID,
  payment_result_id UUID,
  shipping_address_id UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_result_id) REFERENCES payment_results(id) ON DELETE CASCADE,
  FOREIGN KEY (shipping_address_id) REFERENCES shipping_addresses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  image_url VARCHAR(320) NOT NULL,
  image_url_filename VARCHAR(600) NOT NULL,
  price INT NOT NULL,
  order_id UUID,
  product_id UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipping_addresses(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  postal_code VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  order_id UUID,
  user_id UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- may just be a column on orders table
CREATE TABLE payment_results(
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status VARCHAR(255),
  email_address VARCHAR(255),
  order_id UUID,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);