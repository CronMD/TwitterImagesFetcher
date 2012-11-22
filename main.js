var http = require('http');
var url = require('url');

function getPage(urlString, callback){
	urlObject = url.parse(urlString);

	urlObject.port = urlObject.port == undefined ? 80 : urlObject.port;
	urlObject.path = urlObject.path == undefined ? '/' : urlObject.path;

	http.request({host: urlObject.host, port: urlObject.port, path: urlObject.path}, function (res) {
		var dataBuf = '';
		res.on('data', function (chunk) {
			dataBuf += chunk.toString();
		}).on('end', function () { 
			callback(dataBuf);
		}); 
	}).end();	
}

var pageUrl = null;

function printTwitterChunk(urlAddress) {
	getPage(urlAddress, function (page) {
		var obj = JSON.parse(page);

		var re = /https:\/\/pbs\.twimg\.com\/media\/\S+.jpg/igm;
		var arImages = obj.items_html.match(re);

		for(var key in arImages) {
			console.log(arImages[key]);
		}

		if(obj.has_more_items) {
			printTwitterChunk(pageUrl + obj.max_id);
		}
	});
}

function getMaxId(accountName) {
	var twitterUrl = 'https://twitter.com/' + accountName;

	getPage(twitterUrl, function (page) {
		var re = /data-max-id="(\d+)"/igm;
		var arMaxId = re.exec(page);

		if(arMaxId) {
			pageUrl = 'https://twitter.com/i/profiles/show/' + accountName + '/timeline?include_available_features=1&include_entities=1&max_id='	
			printTwitterChunk(pageUrl + arMaxId[1]);
		} else {
			console.log("Max id not found");
		}
	});
}

/*process.argv.forEach(function (val, index) {
	console.log('index: ' + index + ' value: ' + val);
});*/

if(process.argv.length < 3) {
	console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <TwitterAccount>');
	return;
}

getMaxId(process.argv[2]);


