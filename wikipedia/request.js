const url = "https://de.wikipedia.org/w/api.php";
const queryParams = ["action=query","format=json","list=search","srlimit=30"];
const squery = "?action=query&format=json&list=search&srsearch=Einstein";


function isUndefined(object){ return typeof object == 'undefined';  }

function getRequestUrl(q) {
    return url+ "?"+ queryParams.join("&") + "&srsearch="+q;
}

function getParams(query , params){
    for(var element in query){
        if(!(element ==="Q" || element === "page" || element === "filter")) {
            return 400;
        }
    }
    if (isUndefined(query.Q)) return 400;
    params.q = encodeURIComponent(query.Q);
    if (!isUndefined(query.page)) {
        params.page.limit  = isUndefined(query.page.limit)  ? Number(params.page.limit)  : Number(query.page.limit);
        params.page.offset = isUndefined(query.page.offset) ? Number(params.page.offset) : Number(query.page.offset);
        if (!isUndefined(query.page.limit)  && query.page.limit == '')  return 400;
        if (!isUndefined(query.page.offset) && query.page.offset == '') return 400;
    }
    if ( isNaN(params.page.limit)  || params.page.limit <= 0) return 400;
    if ( isNaN(params.page.offset) || params.page.offset < 0) return 400;

    if (!isUndefined(query.filter)){
        for( filter in query.filter	){
            params.filter.count++ ;
            params.filter.data.push(
                {
                    name:filterParam,
                    value:query.filter[filter]
                }
            );
        }
    }
    return 200;
}
var errorHandler = require("./errorhandler.js");

module.exports.makeRequest =  function (query, accept , errCallback ,sendCallback) {
    var request = require('request-promise');
    var status = 200;
    if (!accept) {
        errCallback(errorHandler.getMessage(406),406);
        return 0;
    }
    var params = {
        q : "",
        page : {
            offset : 0 ,
            limit : 10
        },
        filter : {
            count : 0,
            data : []
        }
    };
    status = getParams(query,params);
    if (status!=200){
        errCallback(errorHandler.getMessage(status),status);
        return 0;
    }
    request(getRequestUrl(params.q))
        .then(function(requestResult){
            return JSON.parse(requestResult);
        })
        .then(function(JSONresponse){
            var responseHandler = require("./responsHandler.js").getHandler(params);
            for(element in JSONresponse.query.search)
                responseHandler.addData(JSONresponse.query.search[element]);

            sendCallback(responseHandler.getResponse());
        });
};
