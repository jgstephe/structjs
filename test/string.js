var should = require('should')
  , fs     = require('fs')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('String - Read')

var Test = new Struct({
  str:    Struct.String(7),
  offset: Struct.Uint8,
  result: Struct.String({
    length: 1, size: 2, littleEndian: true,
    storage: Struct.Ref('storage')
  }),
  storage: Struct.Storage({ offset: Struct.Ref('offset') })
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/string.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('String',  function() { t.str.should.eql('Offset:') })
test('Offset',  function() { t.offset.should.eql(0xe)    })
test('Storage', function() { t.result.should.eql('✓')    })

suite('String - Write')

var packed
before(function() {
  t.offset = 0xc
  packed = utils.toBuffer(t.pack())
})

test('String', function() {
  packed.toString('utf-8', 0, 7).should.eql('Offset:')
})

test('Offset', function() {
  packed.readUInt8(7).should.eql(0xc)
})

test('Storage', function() {
  packed.toString('utf-16le', 8, 10).should.eql('✓')
})