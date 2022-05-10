import { db } from "../DB/db.config.js";

export class Post {
  constructor(
    id,
    userId,
    title,
    text,
    date,
    imgUrl,
    likesCount,
    isPreview,
    preview
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.text = text;
    this.date = date;
    this.imgUrl = imgUrl;
    this.likesCount = likesCount;
    this.isPreview = isPreview;
    this.preview = preview;
  }

  static async getPosts() {
    const sqlGetPost = `SELECT title, postId, text, date, imgUrl, fk_userId_post, username, picUrl, likesCount, commentCount, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;
    try {
      const [posts, _] = await db.execute(sqlGetPost);
      return posts;
    } catch (error) {
      throw error;
    }
  }
  static async getUserPosts(userId) {
    const GET_USER_POSTS = `SELECT title, postId, text, date, imgUrl, fk_userId_post, username, picUrl, likesCount, commentCount, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post="${userId}" AND tbl_user.id="${userId}"`;
    try {
      const [posts, _] = await db.execute(GET_USER_POSTS);
      const postsInOrder = posts.sort((a, b) => {
        if (a.postId < b.postId) return 1;
        else return -1;
      });
      return postsInOrder;
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

  async create() {
    console.log(this.isPreview, this.preview);
    const sqlCreatePost =
      this.isPreview === 1
        ? `INSERT INTO tbl_post (fk_userId_post, title, text, date, imgUrl, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo ) 
        VALUES (${this.userId},"${this.title}", "${this.text}", 
        "${this.date}","${this.imgUrl}","${this.isPreview}",
        "${this.preview.title}","${this.preview.description.substr(0, 100)}",
        "${this.preview.image}",
        "${this.preview.publisher !== null ? this.preview.publisher : ""}",
        "${this.preview.url}",
        "${this.preview.logo !== null ? this.preview.logo : ""}")`
        : `INSERT INTO tbl_post (fk_userId_post, title, text, date, imgUrl) VALUES (${this.userId},"${this.title}", "${this.text}", "${this.date}","${this.imgUrl}")`;
    try {
      const [res, _] = await db.execute(sqlCreatePost);
      const { insertId } = res;
      return insertId;
    } catch (error) {
      console.log(error);
    }
  }
}
