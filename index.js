var http = require('http'),
httpProxy = require('http-proxy');

//
// Create a proxy server with custom application logic
//

var enableCors = function(req, res) {
	if (req.headers['access-control-request-method']) {
		res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
	}

	if (req.headers['access-control-request-headers']) {
		res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
	}

	if (req.headers.origin) {
		res.setHeader('access-control-allow-origin', req.headers.origin);
		res.setHeader('access-control-allow-credentials', 'true');
	}
};

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    // proxyReq.setHeader('Access-Control-Allow-Origin', 'api.mashvisor.com');

    enableCors(req, res);
});
var server = http.createServer(function(req, res) {
    if (req.method === 'OPTIONS') {
		enableCors(req, res);
		res.writeHead(200);
		res.end();
		return;
    }
    
    proxy.web(req, res, {
        target: {
            protocol: 'https:',
            host: 'api.mashvisor.com',
        },
		secure: true,
        changeOrigin: true,
    }, function(err) {
		sendError(res, err);
	});

    
    proxy.on('error', (err, req, res) => {
        console.log('Proxy server error: \n', err);
        res.status(500).json({ message: err.message });
      });
});

console.log("listening on port 8000")
server.listen(process.env.PORT || 8000);
