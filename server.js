// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');


var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var app     = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8010;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

//Request parametrs: search string productid
router.get('/', function(req, res) {
	var search_string = req.param('search_string');

  	var util = require('util');
	var OperationHelper = require('apac').OperationHelper;

	var opHelper = new OperationHelper({
	    awsId:     'AKIAIRTFYIESCSANDOPA',
	    awsSecret: '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',
	    assocId:   '5297-5128-8688',
	    // xml2jsOptions: an extra, optional, parameter for if you want to pass additional options for the xml2js module. (see https://github.com/Leonidas-from-XIV/node-xml2js#options)
	    version:   '2013-08-01'
	    // your version of using product advertising api, default: 2013-08-01
	});


	// execute(operation, params, callback)
	// operation: select from http://docs.aws.amazon.com/AWSECommerceService/latest/DG/SummaryofA2SOperations.html
	// params: parameters for operation (optional)
	// callback(err, parsed, raw): callback function handling results. err = potential errors raised from xml2js.parseString() or http.request(). parsed = xml2js parsed response. raw = raw xml response.

	opHelper.execute('ItemLookup', {
	  'ItemId': search_string,
	  'ResponseGroup': 'EditorialReview,Images,ItemAttributes,Offers,Reviews'
	}, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
	    if(results){
	        var url = results.ItemLookupResponse.Items[0].Item[0].CustomerReviews[0].IFrameURL[0];
	        // var url = "http://www.amazon.com/reviews/iframe?akid=AKIAIRTFYIESCSANDOPA&alinkCode=xm2&asin=B00PATII82&atag=5297-5128-8688&exp=2015-11-09T00%3A34%3A05Z&v=2&sig=zsZvPELbc9qFISAmTs5ip9KVHq1weUT%2B5vc7pT%2BVgbY%3D";

	        request(url, function(error, response, html){
	            if(!error){
	                var $ = cheerio.load(html);

	                var title;
	                var json = { title : "", release : "", rating : ""};

	                // We'll use the unique header class as a starting point.
	                var re = $('.asinReviewsSummary a img').attr('alt');
	                res.json({ review: re });   
	                console.log(re);
	            }
	        });
	        }
	});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/apiv1.1', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);