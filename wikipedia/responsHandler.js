
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

    Handler.isValid = function(result){
        return true;
    };

    Handler.getResponse = function () {
        var result = RequestObject(1);
        result.links.self.meta.count = this.data.length;
        result.links.self.meta.offset = params.page.offset;
        result.links.self.meta.limit = params.page.limit;
        result.data= this.data;
        return result
    };
    Handler.addData = function(element) {
        console.log((params.page.offset - this.data.length));
        if( this.data.length < params.page.limit){
            var result = RequestDataObject(1);
            result.id = ++this.resourceId;
            result.attributes.title = element.title;
            result.attributes.url = "https://de.wikipedia.org/wiki/"+ encodeURIComponent(element.title);
            result.attributes.description = element.snippet;
            result.attributes.licenses.push({
                value: "CC-BY-SA",
                copyrighted : true
            });

            console.log(result);
            if(this.offsetCounter<= 0){
                if(this.isValid(result)){
                    this.data.push(result);
                }
            }else
                this.offsetCounter--;
        }
    };
    return Handler;
};