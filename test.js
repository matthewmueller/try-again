/**
 * Module Dependencies
 */

var Emitter = require('events').EventEmitter
var assert = require('assert')
var Again = require('./')

/**
 * Tests
 */

describe('tryagain', function() {

  it('should support a successful connection', function(done) {
    var client = Client({
      success: [100]
    })

    var again = Again()
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, done)
  })

  it('should support connecting after a bit', function(done) {
    var client = Client({
      success: [1000]
    })

    var again = Again()
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, done)
  })

  it('should support the failure case', function(done) {
    var client = Client({
      failure: [100, 100, 100, 100, 100, 100, 100, 100, 100]
    })

    var again = Again({ max: 200 })
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, function(err) {
      assert.equal(err.message, 'failure')
      done()
    })
  })

  it('should support failing after a bit', function(done) {
    var client = Client({
      failure: [500, 500, 500]
    })

    var again = Again({ retries: 2, max: 200 })
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, function(err) {
      assert.equal(err.message, 'failure')
      done()
    })
  })

  it('should support failing, then connecting', function(done) {
    var client = Client({
      success: [200, 200],
      failure: [100]
    })

    var again = Again()
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, done)
  })

  it('should support connecting, then failing twice, then connecting', function(done) {
    var client = Client({
      success: [100, null, 100],
      failure: [200, 100, null]
    })

    var again = Again()
    var connected = 2
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, function(err) {
      if (err) return done(err)
      if (!--connected) done()
    })
  })

  it('should eventually connect after timeouts', function(done) {
    var client = Client({
      success: [500, 300, 100]
    })

    var again = Again({ timeout: 200, jitter: 0, min: 80 })
    var connected = 2
    again(function (success, failure) {
      var c = client()
      c.on('success', success)
      c.on('failure', failure)
    }, done)
  })
})

/**
 * Create a client
 */

function Client (states, error) {
  states.success = states.success || []
  states.failure = states.failure || []
  var idx = -1

  return function client () {
    var emitter = new Emitter()
    idx++

    if (states.success[idx]) {
      setTimeout(function() {
        emitter.emit('success')
      }, states.success[idx])
    }

    if (states.failure[idx]) {
      setTimeout(function() {
        emitter.emit('failure', error || new Error('failure'))
      }, states.failure[idx])
    }

    return emitter
  }
}
