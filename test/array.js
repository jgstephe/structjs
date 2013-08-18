var should = require('should')
  , fs     = require('fs')
  , crypto = require('crypto')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('Array - Read')

var Test = new Struct({
  nums:    Struct.Array(Struct.Uint8, 4),
  strs:    Struct.Array(Struct.String(4), 3),
  structs: Struct.Array(new Struct({
    c: Struct.String(1),
    n: Struct.Uint8
  }), 3)
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/array.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('Number Array', function() {
  t.nums.should.have.lengthOf(4)
  t.nums.should.include(1)
  t.nums.should.include(2)
  t.nums.should.include(3)
  t.nums.should.include(4)
})

test('String Array', function() {
  t.strs.should.have.lengthOf(3)
  t.strs.should.include('qwer')
  t.strs.should.include('asdf')
  t.strs.should.include('zxcv')
})

test('Struct Array', function() {
  t.structs.should.have.lengthOf(3)
  with(t.structs[0]) {
    c.should.equal('a')
    n.should.equal(0x61)
  }
  with(t.structs[1]) {
    c.should.equal('b')
    n.should.equal(0x62)
  }
  with(t.structs[2]) {
    c.should.equal('c')
    n.should.equal(0x63)
  }
})

suite('Array - Write')

test('checksum should be equal', function() {
  var packed = utils.toBuffer(t.pack())
  crypto.createHash('md5').update(buffer).digest('base64')
    .should.eql(
      crypto.createHash('md5').update(packed).digest('base64')
    )
})