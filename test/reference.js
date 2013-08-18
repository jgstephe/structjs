var should = require('should')
  , fs     = require('fs')
  , crypto = require('crypto')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('Reference - Read')

var Test = new Struct({
  count: Struct.Uint8,
  nums:  Struct.Array(Struct.Uint8, Struct.Ref('count'))
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/reference.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('Count', function() {
  t.count.should.equal(4)
})

test('Array of dynamic Length', function() {
  t.nums.should.have.lengthOf(4)
  t.nums.should.include(1, 2, 3, 4)
})

suite('Reference - Write')

var packed
before(function() {
  packed = utils.toBuffer(t.pack())
})

test('Checksum should be equal', function() {
  crypto.createHash('md5').update(buffer).digest('base64')
    .should.eql(
      crypto.createHash('md5').update(packed).digest('base64')
    )
})

test('Modifications should be re-mapped properly', function() {
  t.nums.shift()
  t.nums.pop()
  packed = utils.toBuffer(t.pack())
  packed.length.should.equal(3)
  packed.readUInt8(0).should.equal(2)
  packed.readUInt8(1).should.equal(2)
  packed.readUInt8(2).should.equal(3)
})