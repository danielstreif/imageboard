const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("public"));

app.get("/images", (req, res) => {
    db.getImages()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch((err) => {
            console.log(err);
        });
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => console.log("Server listening"));
}
