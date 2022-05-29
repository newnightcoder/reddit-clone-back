import bcrypt from "bcrypt";
import { db } from "../DB/db.config.js";
import { createToken } from "../middleware/jwt.js";

export class User {
  constructor(
    id,
    email,
    password,
    username,
    avatarImg,
    bannerImg,
    creationDate,
    role
  ) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.username = username;
    this.avatarImg = avatarImg;
    this.bannerImg = bannerImg;
    this.creationDate = creationDate;
    this.role = role;
  }

  async login() {
    const sql_findUser = `SELECT * FROM tbl_user WHERE email = ?`;
    console.log("password received", this.password);

    try {
      const [user, _metadata] = await db.execute(sql_findUser, [this.email]);
      if (user.length !== 0) {
        const match = await bcrypt.compare(this.password, user[0].password);
        if (match) {
          console.log("user from model", user[0]);
          const accessToken = createToken(user[0]);
          return { user: user[0], accessToken };
        } else {
          return { error: "password" };
        }
      } else {
        return { error: "404" };
      }
    } catch (error) {
      return { error: "database" };
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

  async addAvatarImg(fileLocation, imgType) {
    const sqlAdd_avatarImg = `UPDATE tbl_user
    SET picUrl = "${fileLocation}" WHERE id=?`;
    const sqlGet_avatarImg = `SELECT picUrl FROM tbl_user WHERE id = ?`;

    const sqlAdd_bannerImg = `UPDATE tbl_user
    SET bannerUrl = "${fileLocation}" WHERE id=?`;
    const sqlGet_bannerImg = `SELECT bannerUrl FROM tbl_user WHERE id = ?`;

    const connection = await db.getConnection();

    switch (imgType) {
      case "pic":
        {
          try {
            console.log("pic request");
            const res = await connection.execute(sqlAdd_avatarImg, [this.id]);
            if (res) {
              const [avatarImg, _] = await connection.execute(
                sqlGet_avatarImg,
                [this.id]
              );
              return avatarImg[0].picUrl;
            }
          } catch (error) {
            throw error;
          } finally {
            connection.release();
          }
        }
        break;
      case "banner":
        {
          try {
            console.log("banner request");
            const res = await connection.execute(sqlAdd_bannerImg, [this.id]);
            if (res) {
              const [bannerImg, _] = await connection.execute(
                sqlGet_bannerImg,
                [this.id]
              );
              return bannerImg[0].bannerUrl;
            }
          } catch (error) {
            throw error;
          } finally {
            connection.release();
          }
        }
        break;
      default:
        break;
    }
  }
}
