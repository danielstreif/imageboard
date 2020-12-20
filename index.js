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

app.use(
    express.urlencoded({
        extended: true,
    }),
    express.json()
);

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.get("/request-more/:id", (req, res) => {
    db.getMoreImages(req.params.id)
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.get("/active-image/:id", (req, res) => {
    db.getSingleImage(req.params.id)
        .then(({ rows }) => {
            rows[0].time = rows[0].created_at.toLocaleString();
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.get("/delete-image/:id", (req, res) => {
    db.deleteImage(req.params.id)
        .then(({ rows }) => {
            const filename = rows[0].url.replace(s3Url, "");
            s3.delete(filename);
            res.json({ success: true });
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.get("/comments/:id", (req, res) => {
    db.getComments(req.params.id)
        .then(({ rows }) => {
            for (let i in rows) {
                rows[i].time = rows[i].created_at.toLocaleString();
            }
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.post("/comment", (req, res) => {
    const { data } = req.body;
    const output = {};
    db.addComment(data)
        .then(({ rows }) => {
            output.id = rows[0].id;
            output.time = rows[0].created_at.toLocaleString();
            output.comment = data[0];
            output.username = data[1];
            res.json(output);
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
        });
});

app.get("/comment-delete/:id", (req, res) => {
    db.deleteComment(req.params.id)
        .then(() => {
            res.json({ success: true });
        })
        .catch((err) => {
            console.log(err);
            res.json({ success: false });
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
