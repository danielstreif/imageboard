const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getImages = () => {
    return db.query(`SELECT * FROM images
    ORDER BY id DESC
    LIMIT 6`);
};

module.exports.getSingleImage = (id) => {
    return db.query(
        `SELECT * FROM images
    WHERE id = $1`,
        [id]
    );
};

module.exports.uploadImage = (params) => {
    return db.query(
        `INSERT INTO images (title, description, username, url)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        params
    );
};

module.exports.getPreviousImage = (id) => {
    return db.query(
        `SELECT * FROM images
    WHERE id > $1
    ORDER BY id ASC
    LIMIT 1`,
        [id]
    );
};

module.exports.getNextImage = (id) => {
    return db.query(
        `SELECT * FROM images
    WHERE id < $1
    ORDER BY id DESC
    LIMIT 1`,
        [id]
    );
};
