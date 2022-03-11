import { db } from "../DB/db.config.js";

export class User {
  constructor(id, email, password, username, avatarImg, creationDate, role) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.username = username;
    this.avatarImg = avatarImg;
    this.creationDate = creationDate;
    this.role = role;
  }

  async login() {
    const sql_findUser = `SELECT * FROM tbl_user WHERE email = ?`;
    try {
      const [user, _metadata] = await db.execute(sql_findUser, [this.email]);
      console.log("user from model", user[0]);
      return user[0];
    } catch (error) {
      throw error;
    }
  }

  async create() {
    const sql_createUser = `INSERT INTO tbl_user (email, password) VALUES (?, ?)`;
    try {
      const [user, _] = await db.execute(sql_createUser, [
        this.email,
        this.password,
      ]);
      return user.insertId;
    } catch (error) {
      throw error;
    }
  }
  async delete() {
    const sql_deleteUser = `DELETE FROM tbl_user WHERE id=${this.id}`;
    try {
      const [user, _] = await db.execute(sql_deleteUser);
      return user.insertId;
    } catch (error) {
      throw error;
    }
  }

  async addUsername() {
    const sql_addUserName = `
    UPDATE tbl_user 
    SET username =?, creationDate=?
    WHERE id = ?
    `;
    const sql_getUser = `SELECT username, email, creationDate FROM tbl_user WHERE id=? `;
    const connection = await db.getConnection();
    try {
      const res = await connection.execute(sql_addUserName, [
        this.username,
        this.creationDate,
        this.id,
      ]);
      if (res) {
        const [user, _] = await connection.execute(sql_getUser, [this.id]);
        return user[0];
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async addAvatarImg(path) {
    const imgUrlHost = "https://social-media-sql-backend.herokuapp.com";
    const sqlAdd_avatarImg = `UPDATE tbl_user
    SET picUrl = "${imgUrlHost}/${path}" WHERE id=?`;
    const sqlGet_avatarImg = `SELECT picUrl FROM tbl_user WHERE id = ?`;

    const connection = await db.getConnection();
    try {
      const res = await connection.execute(sqlAdd_avatarImg, [this.id]);
      if (res) {
        const [avatarImg, _] = await connection.execute(sqlGet_avatarImg, [
          this.id,
        ]);
        return avatarImg[0].picUrl;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}
