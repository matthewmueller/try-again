/**
 * Module Dependencies
 */

var errors = require('combine-errors')
var debug = require('debug')('again')
var uniq = require('lodash.uniqby')
var Backoff = require('backo')
var once = require('once')

/**
 * Export `again`
 */

function Again (options) {
  options = options || {}
  options.jitter = options.jitter || .3

  return function again (fn, unsuccessful) {
    unsuccessful = unsuccessful || function(){}

    var retries = options.retries || 7
    var backo = new Backoff(options)
    var errs = []

    return fn(once(success), once(failure))

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
        fn(once(success), once(failure))
      }, backo.duration())
    }
  }
}
