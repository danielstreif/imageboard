(function () {
    Vue.component("modal", {
        template: "#template",
        props: ["id", "modalActive"],
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
            hidePopup: function () {
                this.deleteId = "";
            },
            forgetModal: function () {
                this.$emit("forget");
                this.$emit("close");
            },
        },
        watch: {
            modalActive: requestActiveImage,
        },
        created() {
            var self = this;
            window.addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft") {
                    self.prevImage();
                }
                if (e.key === "ArrowRight") {
                    self.nextImage();
                }
                if (e.key === "Escape" && !self.deleteId) {
                    self.$emit("close");
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
                active: "",
            };
        },
        mounted: requestComments,
        methods: {
            handlePost: function (e) {
                e.preventDefault();
                var self = this;
                var input = { data: [this.comment, this.username, this.id] };
                axios
                    .post("/comment", input)
                    .then(function ({ data }) {
                        self.comments.unshift(data);
                        self.active = true;
                        self.username = "";
                        self.comment = "";
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            deleteComment: function (id) {
                var self = this;
                axios
                    .get("/comment-delete/" + id)
                    .then(function () {
                        for (var i in self.comments) {
                            if (self.comments[i].id == id) {
                                self.comments.splice(i, 1);
                            }
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },
        watch: {
            id: requestComments,
        },
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
                    .get("/delete-image/" + self.id)
                    .then(function () {
                        self.$emit("deleted");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            closePopup: function () {
                this.$emit("close");
            },
        },
        created() {
            var self = this;
            window.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    self.$emit("close");
                }
            });
        },
    });

    new Vue({
        el: "main",
        data: {
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
                        self.title = "";
                        self.description = "";
                        self.username = "";
                        self.image = "";
                        self.fileLabel = "Choose a file";
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
                location.hash = "";
                history.pushState({}, "", "/");
                this.modalActive = "";
            },
            forgetImage: function (id) {
                for (var i in this.images) {
                    if (this.images[i].id == id) {
                        this.images.splice(i, 1);
                    }
                }
            },
        },
    });

    function requestActiveImage() {
        var self = this;
        axios
            .get("/active-image/" + this.id)
            .then(function ({ data }) {
                if (data[0]) {
                    self.previous = data[0].prevId;
                    self.next = data[0].nextId;
                    self.image = data[0];
                    location.hash = data[0].id;
                } else {
                    self.$emit("close");
                }
            })
            .catch(function (err) {
                console.log(err);
                self.$emit("close");
            });
    }

    function requestComments() {
        var self = this;
        axios
            .get("/comments/" + this.id)
            .then(function ({ data }) {
                if (data.length > 0) {
                    self.comments = data;
                    self.active = true;
                } else {
                    self.active = "";
                    self.comments = [];
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    }
})();
