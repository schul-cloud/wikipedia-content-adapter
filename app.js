var express = require('express');
var app = express();

// default value for Address and Port
var address = "127.0.0.1";
var port = 3000;

// if necessary parse new port and/or address.
if(process.argv.length > 2){
    for(var i = 2 ; i < process.argv.length ; i++){
        switch (process.argv[i]){
            case "-port" :
                port = process.argv[++i];
                break;
            case "-address" :
                address = process.argv[++i];
                break;
        }
    }
}


app.get('/v1', function (req, res) {
    res = res.set('content-type', 'application/vnd.api+json');
    var accept = !(typeof req.header("accept") == 'undefined');
    accept = accept && !(req.header("accept") == " ");
    accept = accept && !(req.header("accept") == "");
    accept = accept && req.accepts('application/vnd.api+json');
    var fullUrl = req.protocol + '://' + address +":" + port + req.path;
    var wikipedia = require("./wikipedia/Request.js").makeRequest(req.query,fullUrl,accept,
        function (message,status) // error Message callback
        {
            res.status(status);
            res.json(message);
        },
        function (message) // sendMessage callback
        {
            res.status(200);
            res.json(message);
        }
    );
});



process.title = "wikipedia";
console.log(process.title);
var server = app.listen(port, function () {
    console.log("Example app listening at http://%s:%s", address, port)
});
