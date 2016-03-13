
# try-again

  Generic, simple retry module with exponential backoff.

## Installation

```js
npm install try-again
```

## Usage

```
var Again = require('try-again')
var again = Again({
  retries: 8,
  max: 10000,
  jitter: .2,
  factor: 2,
  min: 100
}, function unsuccessful (err) {
  console.error({
    message: 'aborting, tried too many times'
    error: err.stack || err
  })
})

var client = again(function (success, failure) {
  var client = new Client(url)
  client.once('connected', success)
  client.once('close', failure)
  client.once('error', failure)
  return client
})
```

`success` and `failure` are not meant to be called one time they are more like switches
that can be triggered whenever there's a connection or disconnection. The failure case
will call this function again, so it's important it properly resets the client each time.

## License

(The MIT License)

Copyright (c) 2016 Matthew Mueller &lt;mattmuelle@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
