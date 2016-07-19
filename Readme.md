
# try-again

  Generic, simple retry module with exponential backoff.

## Features

- Easy to understand the different states
- Safe functions by design (see below)
- Exponential backoff
- Supports timeouts
- Fatal errors
- Retries

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

// this function will get re-called each time there is
// failure, unless retries is 0 or fatal(...) is called
var client = again(function (success, failure, fatal) {
  var client = new Client(url)
  client.once('connected', success)
  client.once('close', failure)
  client.once('error', failure)
  return client
}, status, failed)

// this function will get called whenever one of the
// 3 functions: success, failure, or fatal get called.
// This function is often used to update connection state.
function status (err) {
  if (err) {
    // there was a failure
    // update connection state accordingly
  } else {
    // there was a success
    // update connection state accordingly
  }
}

// this function is used when the retries have been
// exhausted or the fatal function has been called.
// at this point, there will be no more retries and
// you should consider crashing the process.
function failed (err) {
  console.error({
    message: 'aborting, tried too many times'
    error: err.stack || err
  })
}
```

## Design

You don't need to know the details of how this works to use this module, but if you're interested in knowing how the different states may interact, this should help explain things.

**Everything inside the `again` function should be idempotent**

The function inside `again` will be called multiple times when there is a failure, so it's important that you don't have existing event emitters and other things hanging around. You should create a new client inside this function each time.

**The `success` function only works once and only if `failure` has not already been called**

`failure` may be called after `success` has been called, but `success` will be a noop if `failure` has been called. This is to prevent multiple `success` functions from running if the connection is eventually successful.

**The `status` function will be called each time there is an update, either a successful connection or a failure**

If there is a failure, the `err` parameter will be populated. This function may be called multiple times. It's a good place for logging connection status and setting "connected" state.

**The `failed` function will only be called if the number of attempts to connect have exceeded the retries option**

If the `failed` function is called, it won't try anymore. You probably want to handle this case by failing fast and killing the process.

**The `fatal` function may be used to trigger the `failed` function even if there are retries available.**

You can use the fatal function to skip retrying. Like the `failure` function, the `fatal` function may be called after an initial `success` function, but cannot be called after the `failure` function has previously been called for that cycle.

## Running Tests

```
npm install
make test
```

## License

MIT
