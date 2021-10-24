require('dotenv').config();
const pool = require('../config/db');
const { cloudinary } = require('../middleware/cloudinary');

exports.getImages  = async (req, res, next) => {
  try {
    const allImages = await pool.query('SELECT * FROM images;');
    if (allImages.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "No images found." }] });
    };
    return res.status(200).json({
      success: "Test successful!",
      data: {
        images: allImages.rows
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
    const imageById = await pool.query(
      'SELECT * FROM images WHERE id = $1;', [image_id]
    );

    if (imageById.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: "No images found." }] });
    };

    // times image appears in order history
    let orderItemImageCount = await pool.query(
      'SELECT COUNT(id) FROM order_items WHERE image_id = $1;' [image_id]
    );

    let count = orderItemImageCount.rows[0].count;
    Number(count);

    return res.json({
      success: "Test successful!",
      data: {
        imageById: {...imageById.row[0], count}
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
      await cloudinary.uploader.destroy(currSImageImgFilename);
    };

    const imageById = await pool.query(
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