const pool = require('../config/db');

// *** Insomnia tested / Passed / Works in App
// /users/me
// Private
exports.getUserProfile = async (req, res, next) => {
  const { id } = req.user;
  try {
    const myUserProfile = await pool.query('SELECT id, f_name, l_name, username, user_email, created_at FROM users WHERE users.id = $1;', [id]);
    
    if (myUserProfile.rowCount === 0 || !myUserProfile) {
      return res.status(400).json({ errors: [{ msg: "No info found from user." }] });
    }

    if (myUserProfile.rowCount > 0) {
      let userById = myUserProfile.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      myUserProfile.rows[0].created_at = date;
    }

    let myProfileInfo = await pool.query(
      'SELECT id As profileId, address, address_2, phone, city, state, country, zipcode, company, user_id FROM profiles WHERE user_id = $1;', [id]
    );

    res.status(200).json({
      status: "Success! Generated user profile for editing.",
      data: {
        userData: myUserProfile.rows[0],
        myProfileInfo: myProfileInfo.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
}

// *** Insomnia tested / Passed / Works in App
// Admin views all users
// /users/
// Private / Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const userProfiles = await pool.query('SELECT id, f_name, l_name, user_email, username, role, created_at FROM users;');

    if (userProfiles.rowCount >= 1) {
      for (let i = 0; i < userProfiles.rows.length; i++) {
        let created_at = userProfiles.rows[i].created_at;
        let newCreatedAt = created_at.toISOString().slice(0, 10);
        userProfiles.rows[i].created_at = newCreatedAt;
      }
    };
    return res.status(200).json({
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

// *** Insomnia tested / Passed / Works in App
// /users/:user_id
// Private / Admin
exports.getUserById = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const userData = await pool.query(
      'SELECT id, f_name, l_name, username, user_email, role, created_at FROM users WHERE users.id = $1;', [user_id]
    );

    if (userData.rowCount > 0) {
      let userById = userData.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      userData.rows[0].created_at = date;
    }

    res.status(200).json({
      status: "Success! Here's a user profile.",
      data: {
        userData: userData.rows[0],
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error...");
  }
};

// *** Insomnia tested / Passed / Works in App
// User creates their profile.
// /users/profile
// Private
exports.createUserProfile = async (req, res, next) => {
  const { id } = req.user;
  let { address, address2, phone, city, state, country, zipcode, company } = req.body;

  let profileDataCheck;
  
  profileDataCheck = {
    address, address2, phone, city, state, country,
    zipcode, company
  }
  
  for (const [key, value] of Object.entries(profileDataCheck)) {
    if (!value) {
      profileDataCheck[key] = '';
    }
  }

  // convert object into arr, take values
  const profileChecked = Object.values(profileDataCheck);
  [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, companyChk] = profileChecked;

  try {
    // check if user profile already exists
    const userProfileExists = await pool.query('SELECT * FROM profiles WHERE user_id = $1;', [id]);
      
    if(userProfileExists.rows.length > 0) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Profile already exists." }] });
    }

    const userData = await pool.query('SELECT id, f_name, l_name, username, user_email, created_at FROM users WHERE id = $1;', [id]);

    if (userData.rowCount > 0) {
      let userById = userData.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      userData.rows[0].created_at = date;
    }

    const createProfile = await pool.query(
      'INSERT INTO profiles (address, address_2, phone, city, state, country, zipcode, company, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING address, address_2, phone, city, state, country, zipcode, company, user_id;', [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, companyChk, id]
    );

    if (!createProfile.rows.length > 0) {
      return res.status(400).json({ errors: [{ msg: "No profile was created." }] });
    }
        
    res.status(200).json({
      status: "Success! User profile created!",
      data: {
        userData: userData.rows[0],
        myProfileInfo: createProfile.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
}

// *** Insomnia tested / Passed / Works in App
// User creates their profile.
// /users/profile
// Private
exports.createUserShippingInfo = async (req, res, next) => {
  const { id } = req.user;
  let { fullname, address, zipcode, city, state, country } = req.body;

  if (!fullname || !address || !city || !state || !country || !zipcode) {
    return res.status(406).json({ errors: [{ msg: "All fields are required." }] });
  }

  try {
    const userProfileExists = await pool.query('SELECT * FROM profiles WHERE user_id = $1;', [id]);
      
    if(userProfileExists.rowCount > 0) {
      return res.status(403).json({ errors: [{ msg: "Unauthorized. Profile already exists." }] });
    };

    const userData = await pool.query('SELECT id, f_name, l_name, username, user_email, created_at FROM users WHERE id = $1;', [id]);

    if (userData.rowCount > 0) {
      let userById = userData.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      userData.rows[0].created_at = date;
    }

    const createProfile = await pool.query(
      'INSERT INTO profiles (address, city, state, country, zipcode, user_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING address, city, state, country, zipcode, user_id;', [addressChk, cityChk, stateChk, countryChk, zipcodeChk, id]
    );

    res.status(200).json({
      status: "Success! User profile created!",
      data: {
        myShippingInfo: createProfile.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
}

// *** Insomnia tested / Passed / Works in App
// User updates their own information
// /users/profile
// Private
exports.updateUserInfo = async (req, res, next) => {
  const { id } = req.user;
  let {
    f_name,
    l_name,
    username,
    user_email
  } = req.body;

  let usersDataUpdate;
  let userDataCheck;

  userDataCheck = { f_name, l_name, username, user_email }

  for (const [key, value] of Object.entries(userDataCheck)) {
    if (!value) {
      userDataCheck[key] = '';
    }
  }

  const userChecked = Object.values(userDataCheck);
  [f_nameChk, l_nameChk, usernameChk, user_emailChk] = userChecked;

  try {
    if (usernameChk === '' || !usernameChk) {
      return res.status(400).json({ errors: [{ msg: 'A username is required!' }] });
    }

    if (user_emailChk === '' || !user_emailChk) {
      return res.status(400).json({ errors: [{ msg: 'A user email is required!' }] });
    }

    let emailResult = await pool.query('SELECT user_email, id FROM users WHERE user_email = $1', [ user_emailChk ]);
    let usernameResult = await pool.query('SELECT username, id FROM users WHERE username = $1', [ usernameChk ]);

    if (usernameResult.rowCount !== 0 && usernameResult.rows[0].id !== id) {
      return res.status(400).json({ errors: [{ msg: 'The username already exists!' }] });
    }
      
    if (emailResult.rowCount !== 0 && emailResult.rows[0].id !== id) {
      return res.status(400).json({ errors: [{ msg: 'The email already exists!' }] });
    }

    usersDataUpdate = await pool.query(
      'UPDATE users SET f_name = $1, l_name = $2, username = $3, user_email = $4 WHERE id = $5 RETURNING id, f_name, l_name, username, user_email, created_at;', [f_nameChk, l_nameChk, usernameChk, user_emailChk, id]
    );

    if (usersDataUpdate.rows.length < 1) {
      return res.status(400).json({ errors: [{ msg: "User data failed to update." }] });
    }

    if (usersDataUpdate.rowCount > 0) {
      let userById = usersDataUpdate.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      usersDataUpdate.rows[0].created_at = date;
    }

    const userProfile = await pool.query('SELECT id, address, address_2, phone, city, state, country, zipcode, company, user_id FROM profiles WHERE user_id = $1;', [id]);

    res.status(200).json({
      status: "Success! Profile updated.",
      data: {
        userData: usersDataUpdate.rows[0],
        myProfileInfo: userProfile.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
}

// *** Insomnia tested / Passed / Works in App
// User updates their own information
// /users/profile
// Private
exports.updateUserProfile = async (req, res, next) => {
  // user info - values from profile form data
  const { id } = req.user;
  let {
    address,
    address2,
    phone,
    city,
    state,
    country,
    zipcode,
    company
  } = req.body;

  let profileUpdate;
  let profileDataCheck;

  profileDataCheck = {
    address, address2, phone, city, state, country,
    zipcode, company
  }
  
  for (const [key, value] of Object.entries(profileDataCheck)) {
    if (!value) {
      profileDataCheck[key] = '';
    }
  }

  const profileChecked = Object.values(profileDataCheck);
  [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, companyChk] = profileChecked;

  try {
    const profileExists = await pool.query('SELECT * FROM profiles WHERE user_id = $1;', [id]);

    if (profileExists.rowCount === 0) {
      return res.status(404).json({ errors: [{ msg: 'Profile does not exist.' }] });
    }

    myUserData = await pool.query('SELECT id, f_name, l_name, username, user_email, created_at FROM users WHERE id = $1;', [id]);

    if (myUserData.rows.length < 1) {
      return res.status(400).json({ errors: [{ msg: "User data failed to update." }] });
    }

    if (myUserData.rowCount > 0) {
      let userById = myUserData.rows[0];
      let createdAtDate = userById.created_at;
      let date = createdAtDate.toISOString().slice(0, 10);
      myUserData.rows[0].created_at = date;
    }

    profileUpdate = await pool.query(
      'UPDATE profiles SET address = $1, address_2 = $2, phone = $3, city = $4, state = $5, country = $6, zipcode = $7, company = $8 WHERE user_id = $9 RETURNING id, address, address_2, phone, city, state, country, zipcode, company, user_id;', [addressChk, address2Chk, phoneChk, cityChk, stateChk, countryChk, zipcodeChk, companyChk, id]
    );

    if (profileUpdate.rows.length < 1) {
      return res.status(400).json({ errors: [{ msg: "Could not update profile." }] });
    }

    res.status(200).json({
      status: "Success! Profile updated.",
      data: {
        userData: myUserData.rows[0],
        myProfileInfo: profileUpdate.rows[0]
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  }
}

// *** Insomnia tested / Passed / Works in App
// roles: admin, staff, visitor, banned
// Update user role as Admin.
// /users/:user_id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  const { user_id } = req.params;
  const { f_name, l_name, username, user_email, role } = req.body;
  try {
    const userToUpdate = await pool.query('SELECT f_name, l_name, username, user_email, role FROM users WHERE id = $1;', [user_id]);

    if (userToUpdate.rowCount === 0 || !userToUpdate) {
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
      'UPDATE users SET f_name = $1, l_name = $2, username = $3, user_email = $4, role = $5 WHERE id = $6 RETURNING id, f_name, l_name, username, user_email, role, created_at', [userFName, userLName, userUsername, userEmail, userRole, user_id]
    );
    
    if (updatedUser.rowCount > 0) {
      let created_date = updatedUser.rows[0].created_at;
      let date = created_date.toISOString().slice(0, 10);
      updatedUser.rows[0].created_at = date;
    }

    res.status(200).json({
      status: "Success. Admin changed user role / status",
      data: {
        userData: updatedUser.rows[0]
      }
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error...");
  };
}