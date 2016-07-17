/**
 * Module Dependencies
 */

var errors = require('combine-errors')
var debug = require('debug')('again')
var uniq = require('lodash.uniqby')
var Backoff = require('backo')
var sliced = require('sliced')
var once = require('once')

/**
 * Export `Again`
 */

module.exports = Again

/**
 * Create an `Again` instance
 */

function Again (options) {
  options = options || {}

  options.timeout = options.timeout === undefined ? 10000 : options.timeout
  options.retries = options.retries === undefined ? Infinity : options.retries
  options.jitter = options.jitter === undefined ? 0.3 : options.jitter

  return function again (fn, status, failed) {
    status = status || function(){}
    failed = failed || function(){}

    // only let failed get called once
    failed = once(failed)

    var backo = new Backoff(options)
    var timeout = options.timeout
    var retries = options.retries
    var tid = null
    var errs = []
    var sid = 0

    return retry()

    function retry () {
      var succeed = once(success(sid))
      var exit = once(fatal(sid))
      var fail = once(failure)

      tid = setTimeout(function() {
        debug('timed out after %sms', timeout)
        failure(new Error('operation timed out'))
      }, timeout)
      return fn(succeed, fail, exit)
    }

    function success (id) {
      return function () {
        if (sid !== id) return
        debug('success')
        tid && clearTimeout(tid)
        retries = options.retries
        backo.reset()
        // report a success
        status.apply(null, [null].concat(sliced(arguments)))
      }
    }

    function failure (err) {
      debug('failure')

      tid && clearTimeout(tid)
      err && errs.push(err)

      // don't let an old success id get called
      // after we've called failure. this does
      // not apply the other way, you can call
      // failure after you call success
      sid++

      // report a failure
      status(err)

      if (--retries <= 0) {
        errs = uniq(errs, function (err) {
          return err.message
        })
        return failed(errors(errs))
      }

      var duration = backo.duration()
      debug('sleeping for %sms', duration)
      setTimeout(function() {
        debug('trying again')
        retry()
      }, duration)
    }

    // fatal is a condition where we don't
    // want to retry and we just want to
    // fail completely. we don't want to call
    // this after failure has already been
    // called, so we use the id. This can
    // be called after success has been
    // called though.
    function fatal (id) {
      return function (err) {
        if (sid !== id) return
        debug('fatal')

        // set the retries to 0
        // so we don't retry again
        retries = 0

        // call failure
        return failure(err)
      }
    }
  }
}
