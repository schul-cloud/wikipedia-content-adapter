var express = require('express');
var app = express();

app.get('/v1', function (req, res) {
    res.contentType("application/+vm.json");
    var wikipedia = require("wikipedia/request.js").makeRequest(req.query,
        function (message,status) // error Message callback
        {
            res.status(status);
            res.send(message);
        },
        function (message) // sendMessage callback
        {
            res.send(message);
        }
    );
});



process.title = "wikipedia";
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
