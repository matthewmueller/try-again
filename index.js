/**
 * Module Dependencies
 */

var errors = require('combine-errors')
var debug = require('debug')('again')
var uniq = require('lodash.uniqby')
var Backoff = require('backo')

/**
 * Export `again`
 */

function Again (options, unsuccessful) {
  if (typeof options === 'function') unsuccessful = options, options = {}
  options = options || {}

  return function again (fn) {
    var retries = options.retries || 7
    var backo = new Backoff(options)
    var errs = []

    return fn(success, failure)

    function success () {
      debug('success')
      retries = options.retries || 7
      backo.reset()
    }

    function failure (err) {
      debug('failure')

      if (err) errs.push(err)

      if (!--retries) {
        errs = uniq(errs, function (err) {
          return err.message
        })
        return unsuccessful(errors(errs))
      }

      setTimeout(function () {
        fn(success, failure)
      }, backo.duration())
    }
  }
}
