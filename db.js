const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

module.exports.getImages = () => {
    return db.query(`SELECT * FROM images`);
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
    VALUES ($1, $2, $3, $4)`,
        params
    );
};
