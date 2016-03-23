
# try-again

  Generic, simple retry module with exponential backoff.

## Installation

```js
npm install try-again
```

## Usage

```js
var Again = require('try-again')
var again = Again({
  retries: 8,
  max: 10000,
  jitter: .2,
  factor: 2,
  min: 100
})

var client = again(function (success, failure) {
  var client = new Client(url)
  client.once('connected', success)
  client.once('close', failure)
  client.once('error', failure)
  return client
}, status)

function status (err) {
  console.error({
    message: 'aborting, tried too many times'
    error: err.stack || err
  })
}
```

## Notes

**Everything inside the `again` function should be idempotent**

The function inside `again` will be called multiple times when there is a failure, so it's important that you don't have existing event emitters and other things hanging around. You should create a new client inside this function each time.

**The success function only works once and only if failure has not already been called**

`failure` may be called after `success` has been called, but `success` will be a noop if `failure` has been called. This is to prevent multiple `success` functions from running if the connection is eventually successful.

**The status function will be called each time there is a successful connection, but will only error once**

This `status` function is where you should log connections or set `connected` state. If there is an `err`, it means that we tried connecting `retry` number of times and failed every time.

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
