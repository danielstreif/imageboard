const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const { s3Url } = require("./config.json");

const diskStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, `${__dirname}/uploads`);
    },
    filename: (req, file, callback) => {
        uidSafe(24)
            .then((uid) => {
                callback(null, `${uid}${path.extname(file.originalname)}`);
            })
            .catch((err) => {
                callback(err);
            });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/request-more/*", (req, res) => {
    const id = req.params[0];
    db.getMoreImages(id)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/active-image/*", (req, res) => {
    const id = req.params[0];
    db.getSingleImage(id)
        .then(({ rows }) => {
            rows[0].time = rows[0].created_at.toLocaleString();
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/delete-image/*", (req, res) => {
    const id = req.params[0];
    db.deleteImage(id)
        .then(() => {
            res.json({ success: true });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/comments/*", (req, res) => {
    const id = req.params[0];
    db.getComments(id)
        .then(({ rows }) => {
            for (let i in rows) {
                rows[i].time = rows[i].created_at.toLocaleString();
            }
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

app.post("/upload", uploader.single("image"), s3.upload, (req, res) => {
    if (req.file) {
        const data = req.body;
        data.url = `${s3Url}${req.file.filename}`;
        const params = Object.values(data);
        db.uploadImage(params)
            .then(({ rows }) => {
                data.id = rows[0].id;
                res.json(data);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        res.json({ success: false });
    }
});

app.use(express.static("public"));

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => console.log("Server listening"));
}
