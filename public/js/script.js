(function () {
    Vue.component("comments", {
        template: "#template",
        props: [],
        data: function () {},
        mounted: function () {},
        methods: {},
    });

    Vue.component("modal", {
        template: "#template",
        props: ["id", "modalActive"],
        data: function () {
            return {
                image: "",
            };
        },
        mounted: function () {
            var self = this;
            axios
                .get("/active-image/" + this.id)
                .then(function ({ data }) {
                    self.image = data[0];
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        methods: {
            closeModal: function () {
                this.$emit("close");
            },
            prevImage: function (id) {
                var self = this;
                axios
                    .get("/prev-image/" + id)
                    .then(function ({ data }) {
                        self.image = data[0];
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            nextImage: function (id) {
                var self = this;
                axios
                    .get("/next-image/" + id)
                    .then(function ({ data }) {
                        self.image = data[0];
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },
        created() {
            window.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") {
                    this.prevImage(this.image.id);
                }
                if (e.key === "ArrowRight") {
                    this.nextImage(this.image.id);
                }
            });
        },
    });

    new Vue({
        el: "main",
        data: {
            headingUpload: "Upload your favorite forest image",
            headingImages: "Gallery",
            images: [],
            title: "",
            description: "",
            username: "",
            image: "",
            modalActive: "",
            fileLabel: "Choose a file",
        },
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function ({ data }) {
                    self.images = data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        methods: {
            handleFileChange: function (e) {
                this.image = e.target.files[0];
                this.fileLabel = e.target.files[0].name;
            },
            handleUpload: function (e) {
                e.preventDefault();
                var formData = new FormData();
                var self = this;
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("image", this.image);
                axios
                    .post("/upload", formData)
                    .then(function ({ data }) {
                        self.images.unshift(data);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            openModal: function (id) {
                this.modalActive = id;
            },
            hideModal: function () {
                this.modalActive = null;
            },
        },
        created() {
            window.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && this.modalActive) {
                    this.modalActive = null;
                }
            });
        },
    });
})();
