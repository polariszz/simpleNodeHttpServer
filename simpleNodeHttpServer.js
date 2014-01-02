var http = require('http'),
    fs = require('fs');

exports.createServer = (function() {
  var cache = {},
      DEFAULT_TIMEOUT = 1000 * 60,
      DEFAULT_ROOT = '.',
      DEFAULT_PORT = 8080,
      value,
      fetchCache = function(key, callback) {
        if (cache[key]) {
          console.log('Hit Cache', key);
          value = cache[key];
          clearTimeout(value.timeout);
          value.timeout = setTimeout(function() { delCache(key);}, DEFAULT_TIMEOUT);
          return callback(null, value.value);
        } else {
          console.log('Miss Cache', key);
          fs.readFile(DEFAULT_ROOT + key, function(err, file) {
            if (err) {
              return callback(err);
            }

            value = cache[key] = {
              value: file,
              timeout: setTimeout(function() { delCache(key); }, DEFAULT_TIMEOUT)
            };
            return callback(null, value.value);
          });
        }
      },
      delCache = function(key) {
        delete cache[key];
      },
      createServer = function(root, port, timeout) {
        DEFAULT_TIMEOUT = timeout || DEFAULT_TIMEOUT;
        DEFAULT_ROOT = root || DEFAULT_ROOT;
        DEFAULT_PORT = port || DEFAULT_PORT;

        http.createServer( function( req, res ) {
          if (!req.url || req.url === '/') {
            req.url = '/index.html';
          }

          fetchCache(req.url, function(err, data) {
            if (err) {
              res.writeHead(404);
              return res.end("Not Found");
            }
            res.writeHead(200);
            res.end(data);
          });

        }).listen(DEFAULT_PORT);
      };
  return createServer;
})();
