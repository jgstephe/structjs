var should = require('should')
  , fs     = require('fs')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('Hash')

var Test = new Struct({
  nums:    Struct.Array(Struct.Uint8, 4),
  strs:    Struct.Array(Struct.String(4), 3),
  structs: Struct.Hash(new Struct({
    c: Struct.String(1),
    n: Struct.Uint8
  }), 'c', 3)
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/array.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('Hash Array', function() {
  t.structs.should.have.property('a')
  with(t.structs.a) {
    c.should.equal('a')
    n.should.equal(0x61)
  }
  t.structs.should.have.property('b')
  with(t.structs.b) {
    c.should.equal('b')
    n.should.equal(0x62)
  }
  t.structs.should.have.property('c')
  with(t.structs.c) {
    c.should.equal('c')
    n.should.equal(0x63)
  }
})