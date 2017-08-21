var express = require('express');
var app = express();

app.get('/v1', function (req, res) {
    res = res.set('content-type', 'application/vnd.api+json');
    var accept = !(typeof req.header("accept") == 'undefined');
    accept = accept && !(req.header("accept") == " ");
    accept = accept && !(req.header("accept") == "");
    accept = accept && req.accepts('application/vnd.api+json');
    var wikipedia = require("./wikipedia/request.js").makeRequest(req.query,accept,
        function (message,status) // error Message callback
        {
            if(typeof message === Object) message = JSON.stringify(message);
            res.status(status);
            res.send(message);
        },
        function (message) // sendMessage callback
        {
            if(typeof message === Object) message = JSON.stringify(message);
            res.status(200);
            res.send(message);
        }
    );
});



process.title = "wikipedia";
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
