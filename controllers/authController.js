import bcrypt from "bcrypt";
import { db } from "../DB/db.config.js";
import { createToken } from "../middleware/jwt.js";
import { User } from "../models/userModel.js";

//////////////////////
// LOG EXISTING USER
//////////////////////

export const logUser = async (req, res, next) => {
  const { email, password } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorNotFound = "Aucun compte trouvé avec ces identifiants";
  const errorPassword = "Votre mot de passe est incorrect";
  try {
    const user = await new User(null, email).login();
    if (user === undefined) {
      return res.status(404).json({ error: errorNotFound });
    }
    if (bcrypt.compare(password, user.password)) {
      const accessToken = createToken(user);
      res.status(200).json({ user, isNewUser: false, accessToken });
      next();
    } else res.status(200).json({ error: errorPassword });
  } catch (error) {
    res.status(500).json({ error: errorBackend });
  }
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////

export const createUser = async (req, res, next) => {
  const { email, password } = req.body;
  const salt = 10;
  const hash = bcrypt.hashSync(password, salt);
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorDuplicate = "Un compte associé à cet email existe déjà.";
  const user = new User(null, email, hash);
  try {
    const userId = await user.create();
    res.status(201).json({ userId });
  } catch (error) {
    console.log(error);
    const { errno } = error;
    res
      .status(500)
      .json({ error: errno === 1062 ? errorDuplicate : errorBackend });
  }
};

//////////////////////////////////////
// ADD USERNAME (CREATE USER STEP 2)
//////////////////////////////////////

export const addUserName = async (req, res, next) => {
  const { id, username, creationDate } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorDuplicate =
    "Ce nom d'utilisateur est déjà pris!\nVeuillez en choisir un autre.";
  const user = new User(id, null, null, username, null, creationDate);
  try {
    const result = await user.addUsername();
    const accessToken = createToken(id);
    res.status(200).json({ result, accessToken, isNewUser: true });
  } catch (error) {
    const { errno } = error;
    res.status(500).json({
      error: errno === 1062 ? errorDuplicate : errorBackend,
    });
  }
};

/////////////////////////////////////
// ADD USER PIC (CREATE USER STEP 3)
/////////////////////////////////////

export const addUserPic = async (req, res, next) => {
  const { path } = req.file;
  const { id } = req.body;
  console.log("id", id, "req.body", req.body);
  const user = new User(id, null, null, null, null, null);

  try {
    const picUrl = await user.addAvatarImg(path);
    res.status(200).json({ picUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

/////////////////
// EDIT USERNAME
//////////////////

export const editUsername = async (req, res, next) => {
  const { userId, username } = req.body;
  console.log(userId, username);
  const sql_EditUsername = `UPDATE tbl_user SET username="${username}" WHERE id=${userId}`;
  try {
    const result = await db.execute(sql_EditUsername);
    if (result) {
      console.log(result);
      res.status(200).json({ newName: username });
    }
  } catch (error) {
    throw error;
  }
};

/////////////////////////////////////
// GET SOME USER PROFILE
/////////////////////////////////////

export const getUserProfile = async (req, res, next) => {
  const id = req.body.id;
  const sql_getUserProfile = `SELECT id, username, picUrl, creationDate FROM tbl_user WHERE id=?`;
  try {
    const [user, _] = await db.execute(sql_getUserProfile, [id]);
    if (user) {
      console.log("user profile", user[0]);
      res.status(200).json({ user: user[0] });
      next();
    }
  } catch (error) {
    throw error;
  }
};

/////////////////////////////////////
// DELETE USER
/////////////////////////////////////

export const deleteUser = async (req, res, next) => {
  const { id } = req.body;
  const user = new User(id, null, null, null, null, null);
  try {
    const deleted = await user.delete();
    console.log("deleted result", deleted);
    res.status(200);
  } catch (error) {
    throw error;
  }
};
