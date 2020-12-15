new Vue({
    el: "header",
    data: {
        heading: "Lorem ipsumm",
    },
});

new Vue({
    el: "main",
    data: {
        headingUpload: "Upload an image",
        headingImages: "Lorem",
        images: [],
        title: "",
        description: "",
        username: "",
        image: null,
    },
    mounted: function () {
        var self = this;
        axios
            .get("/images")
            .then(function ({ data }) {
                for (var i in data) {
                    self.images.unshift(data[i]);
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    },
    methods: {
        handleFileChange: function (e) {
            this.image = e.target.files[0];
        },
        handleUpload: function (e) {
            e.preventDefault();
            var formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("image", this.image);
            axios
                .post("/upload", formData)
                .then((res) => {
                    this.images.unshift(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
});
