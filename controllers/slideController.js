require('dotenv').config();
const pool = require('../config/db');
const { cloudinary, removeOnErr } = require('../middleware/cloudinary');

// *** Works in App
// /slides/all
// Private/Admin
exports.getSlideShow = async (req, res, next) => {
  try {
    const carousel = await pool.query(
      'SELECT * FROM slides;'
    );
    if (carousel.rowCount === 0 || !carousel.rows[0]) {
      return res.status(404).json({ errors: [{ msg: "No slides found. Failed to build carousel." }] });
    }

    if (carousel.rowCount >= 1) {
      for (let i = 0; i < carousel.rows.length; i++) {
        let created_at = carousel.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        carousel.rows[i].created_at = newCreatedAt;
      }
    };

    return res.status(200).json({
      success: "Test successful!",
      data: {
        slides: carousel.rows
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Works in App
// /slides/:slide_id
// Private/Admin
exports.getSlideById = async (req, res, next) => {
  try {
    const { slide_id } = req.params;
    const slide = await pool.query(
      'SELECT * FROM slides WHERE id = $1;', [slide_id]
    );
    if (slide.rowCount === 0 || !slide.rows[0]) {
      return res.status(404).json({ errors: [{ msg: "No slide found. Failed to list detail." }] });
    }

    return res.status(200).json({
      success: "Test successful!",
      data: {
        slideInfo: slide.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Works in App
// /slides/add
// Private/Admin
exports.createSlide = async (req,res, next) => {
  const { title, description, theme, category } = req.body;

  let slideImgUrl = '';
  let slideImgFilename = '';

  if (title && title.length > 40) {
    // if (req.file) await removeOnErr(req.file.filename);
    title = title.trim().substring(0, 37) + "...";
  }
  if (theme && theme.length > 40) {
    theme = theme.trim().substring(0, 37) + "...";
  }
  if (description && description.length > 120) {
    description = description.trim().substring(0, 117) + "...";
  }
  try {
    if (req.file && req.file.path) {
      slideImgUrl = req.file.path;
      slideImgFilename = req.file.filename;
    }

    // using multer diskstorage
    if (slideImgUrl.startsWith('dist\\')) {
      let editSlideImgUrl = slideImgUrl.slice(4);
      slideImgUrl = editSlideImgUrl;
    }

    const createdSlide = await pool.query(
      'INSERT INTO slides (title, image_url, image_filename, description, theme, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;', [title, slideImgUrl, slideImgFilename, description, theme, category]
    );

    if (createdSlide.rowCount === 0 || !createdSlide.rows[0]) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Failed to build slide." }] });
    }

    let created_at = createdSlide.rows[0].created_at;
    let newCreatedAt = created_at.toISOString().slice(0, 10);
    createdSlide.rows[0].created_at = newCreatedAt;

    return res.status(200).json({
      success: "Test successful!",
      data: {
        slide: createdSlide.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Works in App
// /slides/:slide_id/update
// Private/Admin
exports.updateSlide = async (req,res, next) => {
  const { slide_id } = req.params;
  const { title, description, theme, category } = req.body;
  let updateSlide;
  let slideImgUrl = '';
  let slideImgFilename = '';

  try {
    if (title && title.length > 40) {
      title = title.trim().substring(0, 37) + "...";
    }
    if (theme && theme.length > 40) {
      theme = theme.trim().substring(0, 37) + "...";
    }
    if (description && description.length > 120) {
      description = description.trim().substring(0, 117) + "...";
    }
    if (req.file && req.file.path) {
      slideImgUrl = req.file.path;
      slideImgFilename = req.file.filename;
    }

    // using multer diskstorage
    if (slideImgUrl.startsWith('dist\\')) {
      let editSlideImgUrl = slideImgUrl.slice(4);
      slideImgUrl = editSlideImgUrl;
    }

    const findSlideIfExists = await pool.query(
      'SELECT * FROM slides WHERE id = $1;', [slide_id]
    );

    if (findSlideIfExists.rowCount === 0 || !findSlideIfExists) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(400).json({ errors: [{ msg: "Slide does not exist." }] });
    }

    // update slide with new img
    if (slideImgUrl !== '') {
      if (slideImgFilename !== '') {
        let currSlideImgFilename = await pool.query(
          'SELECT image_filename FROM slides WHERE id = $1;', [slide_id]
        );

        if (currSlideImgFilename.rows[0].image_filename) {
          await cloudinary.uploader.destroy(currSlideImgFilename.rows[0].image_filename);
        };

        updateSlide = await pool.query(
          'UPDATE slides SET title = $1, image_url = $2, image_filename = $3, description = $4, theme = $5, category = $6 WHERE id = $7 RETURNING *;', [title, slideImgUrl, slideImgFilename, description, theme, category, slide_id]
        )
      };
    };

    // updating no new image
    if (slideImgUrl === '') {
      updateSlide = await pool.query(
        'UPDATE slides SET title = $1, description = $2, theme = $3, category = $4 WHERE id = $5 RETURNING *;', [title, description, theme, category, slide_id]
      );
    };

    if (updateSlide.rowCount === 0 || !updateSlide.rows[0]) {
      if (req.file) await removeOnErr(req.file.filename);
      return res.status(403).json({ errors: [{ msg: "Failed to update slide." }] });
    }

    let created_at = updateSlide.rows[0].created_at;
    let newCreatedAt = created_at.toISOString().slice(0, 10);
    updateSlide.rows[0].created_at = newCreatedAt;

    return res.status(200).json({
      success: "Test successful!",
      data: {
        slide: updateSlide.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};

// *** Works in App
// /slides/:slide_id
// Private/Admin
exports.deleteSlide = async (req,res, next) => {
  const { slide_id } = req.params;
  try {
    const slideToDelete = await pool.query(
      'SELECT * FROM slides WHERE id = $1;', [slide_id]
    );
    if (slideToDelete.rowCount === 0 || !slideToDelete.rows[0]) {
      return res.status(404).json({ errors: [{ msg: "No slide found." }] });
    }

    let currSlideImgFilename = slideToDelete.rows[0].image_filename;
    
    if (currSlideImgFilename) {
      await cloudinary.uploader.destroy(currSlideImgFilename);
    };

    // delete Slide
    await pool.query(
      'DELETE FROM slides WHERE id = $1;', [slide_id]
    );

    return res.status(200).json({
      success: "Slide removed.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
};