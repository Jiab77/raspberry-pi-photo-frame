/*
Made by: Jiab77 <https://github.com/Jiab77>

Based on:
 - https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework
 - https://blog.bloomca.me/2018/12/22/writing-a-web-server-node.html
 - https://nodejs.org/en/docs/guides/getting-started-guide/
 - https://www.w3schools.com/nodejs/nodejs_http.asp
*/

"use strict";

// Dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const process = require('process');

// Config
const documentRoot = '.';
const hostname = process.env.NODE_WEB_HOST || '127.0.0.1';
const port = process.env.NODE_WEB_PORT || 8001;

// Web server
http.createServer(function (request, response) {
	const url = request.url;

	console.log('[Info] Requested:', url);

	var filePath = url;

	// Correct root path
	if (filePath === '/') {
		filePath = documentRoot + '/index.html';
	}
	else {
		filePath = documentRoot + url;
	}

	var extname = String(path.extname(filePath)).toLowerCase();
	var mimeTypes = {
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.json': 'application/json',
		'.png': 'image/png',
		'.jpg': 'image/jpg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
		'.wav': 'audio/wav',
		'.mp4': 'video/mp4',
		'.woff': 'application/font-woff',
		'.ttf': 'application/font-ttf',
		'.eot': 'application/vnd.ms-fontobject',
		'.otf': 'application/font-otf',
		'.wasm': 'application/wasm'
	};

	var contentType = mimeTypes[extname] || 'application/octet-stream';

	// Serve static files
	fs.readFile(filePath, function(error, content) {
		if (error) {
			// display error
			console.log('[Error] Could not serve request:', url);
			console.error(error);

			if(error.code == 'ENOENT') {
				fs.readFile(documentRoot + '/404.html', function(error, content) {
					if (error) {
						console.error(error);
					}
					else {
						response.writeHead(404, { 'Content-Type': 'text/html' });
						response.end(content, 'utf-8');

						// log served 404 page
						console.log('[Info] Served 404 page.');
					}
				});
			}
			else {
				response.writeHead(500);
				response.end('Sorry, check with the site admin for error: '+error.code+' ...\n');
			}
		}
		else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');

			// log served response
			console.log('[Info] Served:', url);
		}
	});

}).listen(port, hostname, () => {
	console.log(`NodeJS Development Server (http://${hostname}:${port}) started`);
});