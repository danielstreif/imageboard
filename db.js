const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

exports.getImages = () => {
    return db.query(`SELECT url, title, id, (
     SELECT id FROM images
     ORDER BY id ASC
     LIMIT 1
 ) AS "lastId"  FROM images
    ORDER BY id DESC
    LIMIT 3`);
};

exports.getMoreImages = (id) => {
    return db.query(
        `SELECT url, title, id, (
     SELECT id FROM images
     ORDER BY id ASC
     LIMIT 1
 ) AS "lastId"  FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 3`,
        [id]
    );
};

exports.getSingleImage = (id) => {
    return db.query(
        `SELECT *, (
     SELECT id FROM images
     WHERE id > $1
     ORDER BY id ASC
     LIMIT 1
 ) AS "prevId", (
     SELECT id FROM images
     WHERE id < $1
     ORDER BY id DESC
     LIMIT 1
 ) AS "nextId" FROM images
    WHERE id = $1`,
        [id]
    );
};

exports.getComments = (id) => {
    return db.query(
        `SELECT * FROM comments
    WHERE image_id = $1`,
        [id]
    );
};

exports.addComment = (params) => {
    return db.query(
        `INSERT INTO comments (comment, username, image_id)
    VALUES ($1, $2, $3)
    RETURNING id, created_at`,
        params
    );
};

exports.uploadImage = (params) => {
    return db.query(
        `INSERT INTO images (title, description, username, url)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        params
    );
};

exports.deleteImage = (id) => {
    return db.query(
        `DELETE FROM images WHERE id = $1
    RETURNING url`,
        [id]
    );
};
