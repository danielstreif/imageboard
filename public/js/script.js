new Vue({
    el: "header",
    data: {
        heading: "Lorem ipsumm",
    },
});

new Vue({
    el: "main",
    data: {
        heading: "Lorem ipsumm",
        images: [],
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
        testMethod: function () {},
    },
});
