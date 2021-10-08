import { db } from "../db/db.config.js";

export class User {
  constructor(id, email, password, username, avatarImg, creationDate) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.username = username;
    this.avatarImg = avatarImg;
    this.creationDate = creationDate;
  }

  async login() {
    const sql_findUser = `SELECT * FROM tbl_user WHERE email = "${this.email}"`;
    try {
      const [user, _metadata] = await db.execute(sql_findUser);
      console.log("user from model", user[0]);
      return user[0];
    } catch (error) {
      throw error;
    }
  }

  async create() {
    const sql_createUser = `INSERT INTO tbl_user (email, password) VALUES ("${this.email}", "${this.password}")`;
    try {
      const [user, _] = await db.execute(sql_createUser);
      return user.insertId;
    } catch (error) {
      throw error;
    }
  }

  async addUsername() {
    const sql_addUserName = `
    UPDATE tbl_user 
    SET username ="${this.username}", creationDate="${this.creationDate}" 
    WHERE id = ${this.id}
    `;
    const sql_getUser = `SELECT username, email, creationDate FROM tbl_user WHERE id="${this.id}" `;
    const connection = await db.getConnection();
    try {
      const res = await connection.execute(sql_addUserName);
      if (res) {
        const [user, _] = await connection.execute(sql_getUser);
        return user[0];
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async addAvatarImg(path) {
    const sqlAdd_avatarImg = `UPDATE tbl_user
    SET picUrl = "http://localhost:3001/${path}" WHERE id=${this.id}`;
    const sqlGet_avatarImg = `SELECT picUrl FROM tbl_user WHERE id = ${this.id}`;

    const connection = await db.getConnection();
    try {
      const res = await connection.execute(sqlAdd_avatarImg);
      if (res) {
        const [avatarImg, _] = await connection.execute(sqlGet_avatarImg);
        return avatarImg[0].picUrl;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}
