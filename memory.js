/**
 * Module Dependencies
 */

let memwatch = require('memwatch-next')
let fs = require('fs')
let Again = require('./')

memwatch.on('leak', function(info) {
  console.log('LEAK', info)
})

// memwatch.on('stats', function(info) {
//   console.log('stats', info)
// })

function FaultyClient (ms) {
  return function client (fn) {
    fs.readFile('./index.js', function(err, buf) {
      // console.log('buffer', buf)
      fn(new Error('unable to connect'))
    })
  }
}

let again = Again()(function (success, failure) {
  let client = FaultyClient()
  client(function(err) {
    if (err) return failure(err)
    success()
  })
}, status, failed)


function status(connected) {
  console.log('failed to connect')
  // console.log('connected?', connected)
}

function failed (error) {
  console.log('failed', error)
}

function generateHeapDumpAndStats(){
  //1. Force garbage collection every time this function is called
  try {
    global.gc();
  } catch (e) {
    console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");
    process.exit();
  }

  // 2. Output Heap stats
  var heapUsed = process.memoryUsage().heapUsed;
  console.log("Program is using " + heapUsed + " bytes of Heap.")

  //3. Get Heap dump
  // process.kill(process.pid, 'SIGUSR2');
}

setInterval(generateHeapDumpAndStats, 1000)
