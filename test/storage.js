var should = require('should')
  , fs     = require('fs')
  , crypto = require('crypto')
  , Struct = require('../lib/struct')
  , utils  = require('./utils')

suite('Storage - Read')

var Test = new Struct({
  count:        Struct.Uint8,
  stringOffset: Struct.Uint8,
  records:      Struct.Array(new Struct({
    length:       Struct.Uint8,
    offset:       Struct.Uint8,
    string:       Struct.String({
      storage:      Struct.Ref('names'),
      offset:       Struct.Ref('offset'),
      length:       Struct.Ref('length')
    })
  }), Struct.Ref('count')),
  names:        Struct.Storage(Struct.Ref('stringOffset'))
})

var t = new Test
var buffer = fs.readFileSync(__dirname + '/data/storage.test')
t.unpack(new DataView(utils.toArrayBuffer(buffer)))

test('Count',  function() { t.count.should.eql(3) })
test('Offset', function() { t.stringOffset.should.eql(8) })
test('Records', function() {
  t.records.should.have.lengthOf(3)
  t.records[0].string.should.eql('a')
  t.records[1].string.should.eql('bcde')
  t.records[2].string.should.eql('fg')
})

suite('Storage - Write')

test('checksum should be equal', function() {
  var packed = utils.toBuffer(t.pack())
  crypto.createHash('md5').update(buffer).digest('base64')
    .should.eql(
      crypto.createHash('md5').update(packed).digest('base64')
    )
})