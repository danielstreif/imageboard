(function () {
    Vue.component("modal", {
        template: "#template",
        props: ["id"],
        data: function () {
            return {
                image: "",
                previous: "",
                next: "",
                deleteId: "",
            };
        },
        mounted: requestActiveImage,
        methods: {
            closeModal: function () {
                this.$emit("close");
            },
            prevImage: function () {
                if (this.image.prevId) {
                    var self = this;
                    axios
                        .get("/active-image/" + this.image.prevId)
                        .then(function ({ data }) {
                            self.previous = data[0].prevId;
                            self.next = data[0].nextId;
                            self.image = data[0];
                            location.hash = data[0].id;
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            },
            // function (this.image) { yourFunctionName(image) }
            nextImage: function () {
                if (this.image.nextId) {
                    var self = this;
                    axios
                        .get("/active-image/" + this.image.nextId)
                        .then(function ({ data }) {
                            self.previous = data[0].prevId;
                            self.next = data[0].nextId;
                            self.image = data[0];
                            location.hash = data[0].id;
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                }
            },
            confirmDelete: function (id) {
                this.deleteId = id;
            },
            closePopup: function () {
                this.deleteId = "";
            },
        },
        watch: {
            modalActive: requestActiveImage,
        },
        created() {
            window.addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft") {
                    this.prevImage();
                }
                if (e.key === "ArrowRight") {
                    this.nextImage();
                }
            });
        },
    });

    Vue.component("comments", {
        template: "#comment-template",
        props: ["id"],
        data: function () {
            return {
                comments: [],
                username: "",
                comment: "",
            };
        },
        mounted: function () {
            var self = this;
            axios
                .get("/comments/" + this.id)
                .then(function ({ data }) {
                    self.comments = data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        methods: {},
    });

    Vue.component("popup", {
        template: "#popup-template",
        props: ["id"],
        data: function () {
            return {};
        },
        mounted: function () {},
        methods: {
            deleteImage: function () {
                var self = this;
                axios
                    .get("/delete-image/" + this.deleteId)
                    .then(function () {
                        self.$emit("close");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },
    });

    new Vue({
        el: "main",
        data: {
            headingUpload: "Upload your favorite forest image",
            headingImages: "Gallery",
            fileLabel: "Choose a file",
            images: [],
            title: "",
            description: "",
            username: "",
            image: "",
            modalActive: location.hash.slice(1),
            moreButton: "",
        },
        mounted: function () {
            var self = this;
            axios
                .get("/images")
                .then(function ({ data }) {
                    for (var i in data) {
                        if (data[i].lastId === data[i].id) {
                            self.moreButton = false;
                        } else {
                            self.moreButton = true;
                        }
                    }
                    self.images = data;
                })
                .catch(function (err) {
                    console.log(err);
                });
            addEventListener("hashchange", function () {
                self.modalActive = location.hash.slice(1);
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
            requestImages: function () {
                var reqId = this.images[this.images.length - 1].id;
                var self = this;
                axios
                    .get("/request-more/" + reqId)
                    .then(function ({ data }) {
                        for (var i in data) {
                            self.images.push(data[i]);
                            if (data[i].lastId === data[i].id) {
                                self.moreButton = false;
                            } else {
                                self.moreButton = true;
                            }
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            hideModal: function () {
                history.pushState({}, "", "/");
                this.modalActive = "";
            },
        },
        created() {
            window.addEventListener("keydown", function (e) {
                if (e.key === "Escape" && this.modalActive) {
                    history.pushState({}, "", "/");
                    this.modalActive = "";
                }
            });
        },
    });

    function requestActiveImage() {
        var self = this;
        axios
            .get("/active-image/" + this.id)
            .then(function ({ data }) {
                self.previous = data[0].prevId;
                self.next = data[0].nextId;
                self.image = data[0];
                location.hash = data[0].id;
            })
            .catch(function (err) {
                console.log(err);
                this.$emit("close");
            });
    }
})();
