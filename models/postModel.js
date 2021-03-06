import { db } from "../DB/db.config.js";

export class Post {
  constructor(userId, title, text, date, imgUrl, isPreview, preview) {
    this.userId = userId;
    this.title = title;
    this.text = text;
    this.date = date;
    this.imgUrl = imgUrl;
    this.isPreview = isPreview;
    this.preview = preview;
  }

  static transformPosts = (array) => {
    const posts = array.map((post, i) => {
      return {
        id: post.postId,
        author: {
          id: post.fk_userId_post,
          username: post.username,
          picUrl: post.picUrl,
        },
        title: post.title,
        text: post.text,
        date: post.date,
        imgUrl: post.imgUrl,
        isPreview: post.isPreview === 1 ? true : false,
        preview: {
          title: post.previewTitle,
          text: post.previewText,
          image: post.previewImg,
          publisher: post.previewPub,
          logo: post.previewPubLogo,
          url: post.previewUrl,
        },
        engagement: {
          likesCount: post.likesCount,
          commentCount: post.commentCount,
        },
      };
    });
    return posts;
  };

  static async getPosts() {
    const sqlGetPost = `SELECT title, postId, text, date, imgUrl, fk_userId_post, username, picUrl, likesCount, commentCount, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;

    try {
      const [result, _] = await db.execute(sqlGetPost);
      if (result) {
        const posts = this.transformPosts(result).sort((a, b) => {
          if (a.id < b.id) return 1;
          if (a.id > b.id) return -1;
          return 0;
        });
        return posts;
      }
    } catch (error) {
      throw error;
    }
  }

  static async getUserPosts(userId) {
    const GET_USER_POSTS = `SELECT title, postId, text, date, imgUrl, fk_userId_post, username, picUrl, likesCount, commentCount, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post="${userId}" AND tbl_user.id="${userId}"`;
    try {
      const [result, _] = await db.execute(GET_USER_POSTS);
      const posts = this.transformPosts(result).sort((a, b) => {
        if (a.postId < b.postId) return 1;
        else return -1;
      });
      return posts;
    } catch (error) {
      throw error;
    }
  }

  static async getLikes() {
    const GET_LIKES = "SELECT * FROM tbl_like";
    try {
      const [likes, _] = await db.execute(GET_LIKES);
      if (likes) return likes;
    } catch (error) {
      throw error;
    }
  }

  async create() {
    const sqlCreatePost = this.isPreview
      ? `INSERT INTO tbl_post (fk_userId_post, title, text, date, imgUrl, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo ) 
        VALUES (${this.userId},"${this.title}", "${this.text}", 
        "${this.date}","${this.imgUrl}",${this.isPreview ? 1 : 0},
        "${this.preview.title}","${this.preview.text.substr(0, 100)}",
        "${this.preview.image}",
        "${this.preview.publisher !== null ? this.preview.publisher : ""}",
        "${this.preview.url}",
        "${this.preview.logo !== null ? this.preview.logo : ""}")`
      : `INSERT INTO tbl_post (fk_userId_post, title, text, date, imgUrl) VALUES (${this.userId},"${this.title}", "${this.text}", "${this.date}","${this.imgUrl}")`;
    const sqlGetPost = `SELECT * FROM tbl_post WHERE postId=?`;

    try {
      const [res, _] = await db.execute(sqlCreatePost);
      const { insertId } = res;
      const post = await db.execute(sqlGetPost, [insertId]);
      const userData = await db.execute(
        `SELECT username, picUrl FROM tbl_user WHERE id=${post[0][0].fk_userId_post}`
      );
      const newPost = {
        ...post[0][0],
        username: userData[0][0].username,
        picUrl: userData[0][0].picUrl,
      };

      console.log("NEW POST", newPost);
      return newPost;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
