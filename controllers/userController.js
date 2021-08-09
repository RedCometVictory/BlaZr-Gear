const axios = require('axios');
const jwtGenerator = require('../middleware/jwtGenerator');
const pool = require('../config/db');
const cloudinary = require('cloudinary').v2;

// *** Insomnia tested / Passed
// TODO --- remove columns in profiles table: gender, status, interests, bio
// settings / dashboard, user gets their own profile
// /users/me
// Private
exports.getUserProfile = async (req, res, next) => {
  // get complete user profile info from both tables
  const { id } = req.user;
  let interestsToArr;
  let interestsArr;
  try {
    const myUserProfile = await pool.query(
      'SELECT id, f_name, l_name, username, user_email, user_avatar, role FROM users WHERE users.id = $1;', [id]
    );

    if (!myUserProfile) {
      // maybe redirect to login page
      return res.status(400).json({ errors: [{ msg: "No info found from user." }] });
    }

    // for now returns null, may need to actually apply info before testing
    const myProfileInfo = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1;', [id]
    );

    // let profileId = myProfileInfo.rows[0].id;
    
    // myUserProfile.rows[0].user_password = undefined;
    // interestsToString = myProfileInfo.rows[0].interests;
    // console.log("interestsToArr......");
    interestsToArr = myProfileInfo.rows[0].interests;
    // console.log(interestsToArr);
    if (interestsToArr && typeof interestsToArr === "string") {
      interestsArr = interestsToArr.split(',').map(interest => '' + interest.trim());
      myProfileInfo.rows[0].interests = interestsArr;
    }
    // Array.isArray(interests) ? interestsToString = interests.join(", ") : interestsToString = interests;

    let birth_date = myProfileInfo.rows[0].birth_date;
    let date = birth_date.toISOString().slice(0, 10); //*
    myProfileInfo.rows[0].birth_date = date;

    // send existing profile to matched user
    res.status(200).json({
      status: "Success! Generated user profile for editing.",
      data: {
        myUserData: myUserProfile.rows[0],
        myProfileInfo: myProfileInfo.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
}

// *** Insomnia tested / Passed
// Admin views all users
// /users/
// Private / Admin
exports.getAllUsers = async (req, res, next) => {
  // need to limit via pagination
  try {
    const userProfiles = await pool.query(
      'SELECT id, f_name, l_name, user_email, username, user_avatar, role FROM users;'
    );
    // if (!userProfiles.rows.length > 0) {
    // if (userProfiles.rows.length !== 0) {
    //   return res.status(400).json({ errors: [{ msg: "Could not get any profiles." }] });
    // }
    res.status(200).json({
      status: "Success! Listing all user profiles!",
      data: {
        profiles: userProfiles.rows
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
}

// *** Insomnia tested / Passed
// /users/:user_id
// Private / Admin
exports.getUserById = async (req, res, next) => {
  //  search for user when clicking their name in the users/members list, in the frontend - if the user is loggged in, then a edit button appears by their profile image (only)
  const { user_id } = req.params;
  // const { id } = req.user;  // not necessary unless access to edit profile by id
  let profileById;

  try {
    // get user profile and socials
    // join with socials, base on profile.user_id
    const userData = await pool.query(
      'SELECT id, f_name, l_name, username, user_email, user_avatar, role FROM users WHERE users.id = $1;', [user_id]
    );

    const profile = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1;', [user_id]
    );

    console.log("profile");
    console.log(profile.rows);
    if (profile.rows[0] === [] || profile.rows[0] === undefined) {
      console.log("no profile info found");
      // profileId = undefined;
      profileById = "No profile data found. Please create a profile so you can make orders.";
    }
    if (profile.rows[0]) {
      profileById = profile.rows[0];
      // apply the following fix to this profile query
      // let birth_date = profile.rows[0].birth_date;
      let birth_date = profileById.birth_date;
      let date = birth_date.toISOString().slice(0, 10);
      profile.rows[0].birth_date = date;
    }
    console.log("==========================");
    console.log(profileById);
    // group by 1 means order data (rows) by the first column
    // const getProfilePosts = await pool.query(
      // 'SELECT P.id, P.title, P.image_url, P.description, COUNT(DISTINCT L.id) AS postLikes, COUNT(DISTINCT C.id) AS postComments FROM posts AS P LEFT JOIN likes AS L ON L.post_like = P.id LEFT JOIN comments AS C ON C.post_id = P.id WHERE P.user_id = $1 GROUP BY P.id;', [user_id]
    // );
  
    // check if current user is following profile by id, returns boolean value
    res.status(200).json({
      status: "Success! Here's a user profile.",
      data: {
        myUserData: userData.rows[0],
        myProfileInfo: profileById, // profile.rows[0],
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed
// User creates their profile.
// /users/profile
// Private
exports.createUserProfile = async (req, res, next) => {
  const { id } = req.user;
  let {
    address,
    address2,
    phone,
    city,
    state,
    country,
    zipcode,
    birthday
  } = req.body;

  // const { path, filename } = req.file;
  // background_image via req.file
  let backgroundUrl = '';
  let backgroundFilename = '';
  let profileDataCheck;
  
  if (birthday === "" || !birthday) {
    return res.status(400).json({ errors: [{ msg: "Include a birthdate for your profile." }] });
  }

  profileDataCheck = {
    address, address2, phone, city, state, country,
    zipcode, birthday, company
  }
  
  for (const [key, value] of Object.entries(profileDataCheck)) {
    if (!value) {
      profileDataCheck[key] = ''; // console.log(value);
    }
  }

  // convert object into arr, take values only, ignore keys
  const profileChecked = Object.values(profileDataCheck);

  [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, birthdayChk, companyChk] = profileChecked;

  try {
    if (req.file && req.file.path) {
      backgroundUrl = req.file.path;
      backgroundFilename = req.file.filename;
    }
    if (backgroundUrl.startsWith('dist\\')) {
      let editBackgroundUrl = backgroundUrl.slice(4);
      backgroundUrl = editBackgroundUrl;
    }
    // check if user profile already exists
    const userProfileExists = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1;', [id]
    );
      
    if(userProfileExists.rows.length > 0) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Profile already exists." }] });
    }

    // create porfile - profile fk connect to users id
    const createProfile = await pool.query(
      'INSERT INTO profiles (address, address_2, phone, city, state, country, zipcode, birth_date, company, background_image, background_image_filename, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,) RETURNING *;', [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, birthdayChk, companyChk, backgroundUrl, backgroundFilename, id]
    );

    if (!createProfile.rows.length > 0) {
      return res.status(400).json({ errors: [{ msg: "No profile was created." }] });
    }
        
    res.status(200).json({
      status: "Success! User profile created!",
      data: {
        myProfileInfo: createProfile.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }

}

// *** Insomnia tested / Passed
// User updates their own information
// /users/profile
// Private
exports.updateUserProfile = async (req, res, next) => {
  // user info - values from profile form data
  const { id } = req.user;
  let {
    f_name,
    l_name,
    username,
    user_email,
    address,
    address2,
    phone,
    city,
    state,
    country,
    zipcode,
    birthday, // required
    company
  } = req.body;

  let avatarUrl = '';
  let avatarFilename = '';
  let backgroundUrl = '';
  let backgroundFilename = '';
  let usersDataUpdate;
  let profileUpdate;
  let userDataCheck;
  let profileDataCheck;

  // let defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/7/72/Default-welcomer.png";
  let confirmedAvatar;

  if (birthday === "" || !birthday) {
    return res.status(400).json({ errors: [{ msg: "Include a birthdate for your profile." }] });
  }
  userDataCheck = {
    f_name, l_name, username, user_email
  }
  profileDataCheck = {
    address, address2, phone, city, state, country,
    zipcode, birthday, company
  }
  
  for (const [key, value] of Object.entries(userDataCheck)) {
    if (!value) {
      userDataCheck[key] = ''; // console.log(value);
    }
  }
  
  for (const [key, value] of Object.entries(profileDataCheck)) {
    if (!value) {
      profileDataCheck[key] = ''; // console.log(value);
    }
  }

  // convert object into arr, take values only, ignore keys
  // console.dir(socials);
  const userChecked = Object.values(userDataCheck);
  const profileChecked = Object.values(profileDataCheck);

  [f_nameChk, l_nameChk, usernameChk, user_emailChk] = userChecked;

  [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, birthdayChk, companyChk] = profileChecked;

  if (req.files) {
    if (req.files['user_avatar']) {
      avatarUrl = req.files['user_avatar'][0]['path'];
      avatarFilename = req.files['user_avatar'][0]['filename'];
    }
    if (req.files['background_image']) {
      backgroundUrl = req.files['background_image'][0]['path'];
      backgroundFilename = req.files['background_image'][0]['filename'];
    }
  }

  if (avatarUrl.startsWith('dist\\')) {
    let editAvatarUrl = avatarUrl.slice(4);
    avatarUrl = editAvatarUrl;
  }
  if (backgroundUrl.startsWith('dist\\')) {
    let editBackgroundUrl = backgroundUrl.slice(4);
    backgroundUrl = editBackgroundUrl;
  }

  try {
    const profileExists = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1;', [id]
    );

    if (profileExists.rowCount < 1) {
      return res.status(404).json({ errors: [{ msg: 'User profile does not exist.' }] });
    }
    // report error if not proper values
    if (usernameChk === '' || !usernameChk) {
      return res.status(400).json({ errors: [{ msg: 'A username is required!' }] });
    }

    if (user_emailChk === '' || !user_emailChk) {
      return res.status(400).json({ errors: [{ msg: 'A user email is required!' }] });
    }
    
    // check for duplicate username, tag name, or email
    let emailResult = await pool.query('SELECT user_email, id FROM users WHERE user_email = $1', [ user_emailChk ]);
    let usernameResult = await pool.query('SELECT username, id FROM users WHERE username = $1', [ usernameChk ]);

    // if (user.rowCount !== 0) {
    if (usernameResult.rowCount !== 0 && usernameResult.rows[0].id !== id) {
      return res.status(400).json({ errors: [{ msg: 'The username already exists!' }] });
    }
      
    if (emailResult.rowCount !== 0 && emailResult.rows[0].id !== id) {
      return res.status(400).json({ errors: [{ msg: 'The email already exists!' }] });
    }

    // cloudinary update user avatar if new one exists
    if (avatarUrl !== '') {
      if (avatarFilename !== '') {
        let currImageFilename = await pool.query(
          'SELECT user_avatar_filename FROM users WHERE id = $1;', [id]
        );

        if (currImageFilename.rows[0].user_avatar_filename) {
          await cloudinary.uploader.destroy(currImageFilename.rows[0].user_avatar_filename);
        }
      }
    
      usersDataUpdate = await pool.query(
        'UPDATE users SET f_name = $1, l_name = $2, username = $3, user_email = $4, user_avatar = $5, user_avatar_filename = $6 WHERE id = $7 RETURNING *;', [f_nameChk, l_nameChk, usernameChk, user_emailChk, avatarUrl, avatarFilename, id]
      );
    }
    // user not updating avatar img
    if (avatarUrl === '') {
      usersDataUpdate = await pool.query(
        'UPDATE users SET f_name = $1, l_name = $2, username = $3, user_email = $4 WHERE id = $5 RETURNING *;', [f_nameChk, l_nameChk, usernameChk, user_emailChk, id]
      );
    }

    // ***Update avatar url, includes avatar used for all posts and comments. As the avatar is being replaced it must be destroyed from cloudinary, same goes for any image that is updated or replaced.

    if (usersDataUpdate.rows.length < 1) {
      return res.status(400).json({ errors: [{ msg: "User data failed to update." }] });
    }
    const checkForProfile = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1;', [id]
    );
    if (checkForProfile.rows.length < 1) {
      return res.status(404).json({ errors: [{ msg: "No profile data exists. Create a profile in order to edit." }] });
    }
    if (backgroundUrl !== '') {
      if (backgroundFilename !== '') {
        let currImageFilename = await pool.query(
          'SELECT background_image_filename FROM profiles WHERE user_id = $1;', [id]
        );
        // console.log('updating background image in cloudinary');
        if (currImageFilename.rows[0].background_image_filename) {
          await cloudinary.uploader.destroy(currImageFilename.rows[0].background_image_filename);
        }
      }
      // console.log("background image, updating profile")
      profileUpdate = await pool.query(
        'UPDATE profiles SET address = $1, address_2 = $2, phone = $3, city = $4, state = $5, country = $6, zipcode = $7, birth_date = $8, company = $9, background_image = $10, background_image_filename = $11 WHERE user_id = $12 RETURNING *;', [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, birthdayChk, companyChk, backgroundUrl, backgroundFilename, id]
      );
    }
    // user chooses not to update their background image
    if (backgroundUrl === '') {
      // console.log("no background image, updating profile")
      profileUpdate = await pool.query(
        'UPDATE profiles SET address = $1, address_2 = $2, phone = $3, city = $4, state = $5, country = $6, zipcode = $7, birth_date = $8, company = $9 WHERE user_id = $10 RETURNING *;', [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, birthdayChk, companyChk, id]
      );
    }

    // console.log(profileUpdate.rows);
    if (profileUpdate.rows.length < 1) {
      return res.status(400).json({ errors: [{ msg: "Could not update profile." }] });
    }

    // const profileUpdateId = profileUpdate.rows[0].id;
    usersDataUpdate.rows[0].user_password = undefined;
    res.status(200).json({
      status: "Success! Profile updated.",
      data: {
        myUserData: usersDataUpdate.rows[0],
        myProfileInfo: profileUpdate.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
}


// Admin edits user and role (by dropdown menu) of user.
// roles: admin, staff, visitor, banned
// Update user role as Admin.
// /users/:user_id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  // const { id } = req.user;
  const { user_id } = req.params;
  const { f_name, l_name, username, user_email, role } = req.body;
  try {
  const userToUpdate = await pool.query(
    'SELECT f_name, l_name, username, user_email, role FROM users WHERE id = $1;', [user_id]
  );

  if (!userToUpdate) {
    return res.status(404).json({ errors: [{ msg: "User not found!" }] });
  }

  
  if (userToUpdate) {
    userToUpdate.rows[0].f_name = f_name || userToUpdate.rows[0].f_name;
    userToUpdate.rows[0].l_name = l_name || userToUpdate.rows[0].l_name;
    userToUpdate.rows[0].username = username || userToUpdate.rows[0].username;
    userToUpdate.rows[0].user_email = user_email || userToUpdate.rows[0].user_email;
    userToUpdate.rows[0].role = role;
  }

  const userFName = userToUpdate.rows[0].f_name;
  const userLName = userToUpdate.rows[0].l_name;
  const userUsername = userToUpdate.rows[0].username;
  const userEmail = userToUpdate.rows[0].user_email;
  const userRole = userToUpdate.rows[0].role;

  const roles = ['admin', 'staff', 'visitor', 'banned'];
  if (!roles.includes(userRole)) {
    return res.status(401).json({ errors: [{ msg: "Incorrect user role! Must be either: admin, staff, visitor, or banned." }] });
  }

  const updatedUser = await pool.query(
    'UPDATE users SET f_name = $1, l_name = $2, username = $3, user_email = $4, role = $5 WHERE id = $6 RETURNING *', [userFName, userLName, userUsername, userEmail, userRole, user_id]
  );
  updatedUser.rows[0].user_password = undefined;
  res.status(200).json({
    status: "Success. Admin changed user role / status",
    data: {
      user: updatedUser.rows[0]
    }
  })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  };
  // TODO - consider making a 'banned' role for user profiles that violate policies. Banned accounts have their reviews hidden and accounts locked, meaning their cart and orders are frozen, unless an order is currently shipped it will finish shipping.
}