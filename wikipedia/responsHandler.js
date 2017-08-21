
function RequestDataObject(version){
    switch(version){
        case 1 : return {
            "type": "resource",
            "id": "resource-1",
            "attributes": {
                "title": "Example Website",
                "url": "https://example.org",
                "licenses": [],
                "mimeType": "text/html",
                "contentCategory": "a",
                "languages": ["de"]
            }
        }
    }
}

function RequestObject(version){
    switch(version){
        case 1 : return {
            jsonapi:
                {
                    version: "1.0",
                    meta :
                        {
                            name: "wikipedia-content-adapter",
                            source: "https://github.com/schul-cloud/wikipedia-content-adapter",
                            description: "This is an adpter for infos from wikipedia."
                        }
                },
            links:
                {
                    self:
                        {
                            href: "http://url.used.to/get/this/document?page[offset]=15&page[limit]=5",
                            meta:
                                {
                                    count: 0,
                                    offset: 0,
                                    limit: 10
                                }
                        },
                    first: "http://url.used.to/get/this/document?page[offset]=0&page[limit]=5",
                    last: "http://url.used.to/get/this/document?page[offset]=50&page[limit]=5",
                    prev: "http://url.used.to/get/this/document?page[offset]=10&page[limit]=5",
                    next: "http://url.used.to/get/this/document?page[offset]=20&page[limit]=5"
                },
            data : []
        }
    }
}

module.exports.getHandler= function(params){

    var Handler = {};
    Handler.data = [];
    Handler.resourceId = 0;
    Handler.offsetCounter = params.page.offset;
    Handler.maxCount = 0;

    Handler.isValid = function(result){
        return true;
    };


    function getLinkUrl(limit,offset){
        if(offset < 0 ) offset = 0;
        var queryTemp = ["Q="+params.q];
        for(var filterparam in params.filter.data){
            queryTemp.push("filter["+ params.filter.data[filterparam].name +"]="+ params.filter.data[filterparam].value);
        }
        queryTemp.push("page[limit]="  + limit);
        queryTemp.push("page[offset]=" + offset);
        return params.serveraddress +"?"+ queryTemp.join("&");
    }


    Handler.getResponse = function () {
        var result = RequestObject(1);
        result.links.self.meta.count = this.data.length;
        result.links.self.meta.offset = params.page.offset;
        result.links.self.meta.limit = params.page.limit;
        result.data= this.data;
        var lastOffset = Math.floor(this.maxCount/params.page.limit)*params.page.limit
        if (lastOffset == this.maxCount ) lastOffset -= params.page.limit;
        var nextOffset = parseInt(params.page.offset) + parseInt(params.page.limit);
        if (nextOffset > lastOffset) nextOffset = lastOffset;

        var prevOffset = params.page.offset - params.page.limit
        // fill the links
        result.links.first 		= getLinkUrl(params.page.limit,0);
        result.links.self.href 	= getLinkUrl(params.page.limit,params.page.offset);
        result.links.prev 			= (prevOffset >= 0 ) ? getLinkUrl(params.page.limit,prevOffset) : null;
        result.links.next 			= (nextOffset > params.page.offset) ? getLinkUrl(params.page.limit,nextOffset) : null;
        result.links.last 			= (nextOffset > params.page.offset) ? getLinkUrl(params.page.limit,lastOffset) : null;



        return result
    };
    Handler.addData = function(element) {
        var result = RequestDataObject(1);
        result.id = ++this.resourceId;
        result.attributes.title = element.title;
        result.attributes.url = "https://de.wikipedia.org/wiki/"+ encodeURIComponent(element.title);
        result.attributes.description = element.snippet;
        result.attributes.licenses.push({
            value: "CC-BY-SA",
            copyrighted : true
        });
        if(this.isValid(result)){
            this.maxCount++;
            if( this.data.length < params.page.limit)
                if(this.offsetCounter<= 0)
                    this.data.push(result);
                else
                    this.offsetCounter--;
        }
    };
    return Handler;
};