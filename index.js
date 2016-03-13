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
  options.jitter = options.jitter || .3
  options.timeout = options.timeout || 5000

  return function again (fn, unsuccessful) {
    unsuccessful = unsuccessful || function(){}
    var timeout = options.timeout || 5000
    var retries = options.retries || 7
    var backo = new Backoff(options)
    var tid = null
    var errs = []
    var sid = 0

    var succeed = once(success)
    var fail = once(failure)

    return retry()

    function retry () {
      var succeed = once(success(sid))
      var fail = once(failure)
      tid = setTimeout(failure, timeout)
      return fn(succeed, fail)
    }

    function success (id) {
      return function () {
        if (sid !== id) return
        debug('success')
        tid && clearTimeout(tid)
        retries = options.retries || 7
        backo.reset()
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
        return unsuccessful(errors(errs))
      }

      setTimeout(retry, backo.duration())
    }
  }
}
