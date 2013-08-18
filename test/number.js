var should = require('should')
  , fs     = require('fs')
  , crypto = require('crypto')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('Number - Read')

var Test = new Struct({
  Int8:    Struct.Int8,
  UInt8:   Struct.Uint8,
  Int16:   Struct.Int16,
  UInt16:  Struct.Uint16,
  Int32:   Struct.Int32,
  UInt32:  Struct.Uint32,
  Float32: Struct.Float32,
  Float64: Struct.Float64
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/number.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('Int8',    function() { t.Int8.should.eql(0x42)                  })
test('UInt8',   function() { t.UInt8.should.eql(0x42)                 })
test('Int16',   function() { t.Int16.should.eql(0xacd)                })
test('UInt16',  function() { t.UInt16.should.eql(0xdead)              })
test('Int32',   function() { t.Int32.should.eql(0xacdface)            })
test('UInt32',  function() { t.UInt32.should.eql(0xfeedface)          })
test('Float32', function() { t.Float32.should.eql(0xdead0000)         })
test('Float64', function() { t.Float64.should.eql(0xdeadbeefcafebabe) })

suite('Number - Write')

var packed = utils.toBuffer(t.pack())

test('checksum should be equal', function() {
  crypto.createHash('md5').update(buffer).digest('base64')
    .should.eql(
      crypto.createHash('md5').update(packed).digest('base64')
    )
})