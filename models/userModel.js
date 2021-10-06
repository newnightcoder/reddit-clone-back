import { db } from "../db/db.config.js";

export class User {
  constructor(email, password, username, avatarImg, creationDate) {
    this.email = email;
    this.password = password;
    this.username = username;
    this.avatarImg = avatarImg;
    this.creationDate = creationDate;
  }

  async login() {
    const FIND_USER = `SELECT * FROM tbl_user WHERE email = "${this.email}"`;
    try {
      const [user, _metadata] = await db.execute(FIND_USER);
      console.log("user from model", user[0]);
      return user[0];
    } catch (error) {
      throw error;
    }
  }

  async create() {}

  async addUsername() {}

  async addAvatarImg() {}
}
