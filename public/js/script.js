(function () {
    Vue.component("modal", {
        template: "#template",
        props: ["id"],
        data: function () {
            return {
                image: null,
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
        },
    });

    new Vue({
        el: "main",
        data: {
            headingUpload: "Upload an image",
            headingImages: "Images",
            images: [],
            title: "",
            description: "",
            username: "",
            image: "",
            modalActive: "",
            id: "",
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
                var self = this;
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("image", this.image);
                axios
                    .post("/upload", formData)
                    .then(function (res) {
                        self.images.unshift(res.data);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
            openModal: function (id) {
                this.modalActive = id;
            },
            hideModal: function (e) {
                this.modalActive = null;
            },
        },
    });
})();
