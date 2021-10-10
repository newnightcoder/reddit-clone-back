import { db } from "../db/db.config.js";

export class Post {
  constructor(id, userId, title, text, date, likesCount) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.text = text;
    this.date = date;
    this.likesCount = likesCount;
  }

  async create() {
    const sqlCreatePost = `INSERT INTO tbl_post (fk_userId_post,title, text, date) VALUES (${this.userId},"${this.title}", "${this.text}","${this.date}")`;

    try {
      const [res, _] = await db.execute(sqlCreatePost);
      const { insertId } = res;
      return insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getLikes() {
    const GET_LIKES = "SELECT * FROM tbl_like";
    try {
      const [likes, _] = await db.execute(GET_LIKES);
      return likes;
    } catch (error) {
      throw error;
    }
  }

  static async getPosts() {
    const GET_POSTS = `SELECT title, postId, text, date, fk_userId_post, username, picUrl, likesCount FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;
    try {
      const [posts, _] = await db.execute(GET_POSTS);
      const postsInOrder = posts.sort((a, b) => {
        if (a.postId < b.postId) return 1;
        else return -1;
      });
      return postsInOrder;
    } catch (error) {
      throw error;
    }
  }
}
