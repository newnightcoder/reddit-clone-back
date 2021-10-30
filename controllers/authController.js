import { createToken } from "../middleware/jwt.js";
import { User } from "../models/userModel.js";

//////////////////////
// LOG EXISTING USER
//////////////////////

export const logUser = async (req, res, next) => {
  const { email, password } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorNotFound = "Aucun compte trouvé avec ces identifiants";
  try {
    const user = await new User(null, email, password).login();
    if (user === undefined) {
      return res.status(404).json({ error: errorNotFound });
    }
    const accessToken = createToken(user);
    res.status(200).json({ user, isNewUser: false, accessToken });
    next();
  } catch (error) {
    res.status(500).json({ error: errorBackend });
  }
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////

export const createUser = async (req, res, next) => {
  const { email, password } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorDuplicate = "Un compte associé à cet email existe déjà.";
  const user = new User(null, email, password);
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
    res.status(200).json({ result, isNewUser: true });
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
