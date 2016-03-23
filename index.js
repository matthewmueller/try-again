/**
 * Module Dependencies
 */

var errors = require('combine-errors')
var debug = require('debug')('again')
var uniq = require('lodash.uniqby')
var Backoff = require('backo')
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

  options.timeout = options.timeout === undefined ? 5000 : options.timeout
  options.retries = options.retries === undefined ? 7 : options.retries
  options.jitter = options.jitter === undefined ? 0.3 : options.jitter

  return function again (fn, status) {
    var backo = new Backoff(options)
    status = status || function(){}
    var timeout = options.timeout
    var retries = options.retries
    var tid = null
    var errs = []
    var sid = 0

    var succeed = once(success)
    var fail = once(failure)

    return retry()

    function retry () {
      var succeed = once(success(sid))
      var fail = once(failure)
      tid = setTimeout(function() {
        debug('timed out after %sms', timeout)
        failure()
      }, timeout)
      return fn(succeed, fail)
    }

    function success (id) {
      return function () {
        if (sid !== id) return
        debug('success')
        tid && clearTimeout(tid)
        retries = options.retries
        backo.reset()
        status(null)
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

      if (!--retries) {
        errs = uniq(errs, function (err) {
          return err.message
        })
        return status(errors(errs))
      }

      var duration = backo.duration()
      debug('sleeping for %sms', duration)
      setTimeout(function() {
        debug('trying again')
        retry()
      }, duration)
    }
  }
}
