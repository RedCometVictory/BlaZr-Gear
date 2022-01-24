require('dotenv').config();
const pool = require('../config/db');
const { cloudinary } = require('../middleware/cloudinary');

exports.getImages  = async (req, res, next) => {
  let { pageNumber, offsetItems } = req.query;
  let page = Number(pageNumber) || 1;
  if (page < 1) page = 1;
  let limit = Number(offsetItems) || 12;
  let offset = (page - 1) * limit;
  let count;
  try {
    const totalImages = await pool.query(
      'SELECT COUNT(id) FROM images;'
    );

    const allImages = await pool.query(
      'SELECT * FROM images GROUP BY id LIMIT $1 OFFSET $2;', [limit, offset]
    );

    count = totalImages.rows[0].count;
    Number(count);

    if (allImages.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "No images found." }] });
    };

    for (let i = 0; i < allImages.rows.length; i++) {
      let created_at = allImages.rows[i].created_at;
      let newCreatedAt = created_at.toISOString().slice(0, 10);
      allImages.rows[i].created_at = newCreatedAt;
    }
    return res.status(200).json({
      success: "Test successful!",
      data: {
        images: allImages.rows,
        page: page,
        pages: count
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

exports.getImageById = async (req, res, next) => {
  const { image_id } = req.params;
  try {
    let image = await pool.query(
      'SELECT * FROM images WHERE id = $1;', [image_id]
    );

    if (image.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "No images found." }] });
    };

    let created_at = image.rows[0].created_at;
    let newCreatedAt = created_at.toISOString().slice(0, 10);
    image.rows[0].created_at = newCreatedAt;

    // times image appears in order history
    let orderItemImageCount = await pool.query(
      'SELECT COUNT(id) FROM order_items WHERE image_id = $1;', [image_id]
    );

    let count = orderItemImageCount.rows[0].count;
    Number(count);

    return res.json({
      success: "Test successful!",
      data: {
        image: {...image.rows[0], count}
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

exports.deleteImage = async (req, res, next) => {
  const { image_id } = req.params;
  try {
    const imageExists = await pool.query(
      'SELECT * FROM images WHERE id = $1;', [image_id]
    );

    if (imageExists.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "No image found." }] });
    };

    let currImageImgFilename = imageExists.rows[0].product_image_filename;
    
    if (currImageImgFilename) {
      await cloudinary.uploader.destroy(currImageImgFilename);
    };

    // image By Id
    await pool.query(
      'DELETE FROM images WHERE id = $1;', [image_id]
    );
    return res.status(200).json({
      success: "Image removed.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};