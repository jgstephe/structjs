var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Storage', function() {
  var data = '03 08 01 00 04 01 02 05 61 62 63 64 65 66 67'
         
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

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('Count',  function() { t.count.should.eql(3) })
    test('Offset', function() { t.stringOffset.should.eql(8) })
    test('Records', function() {
      t.records.should.have.lengthOf(3)
      t.records[0].string.should.eql('a')
      t.records[1].string.should.eql('bcde')
      t.records[2].string.should.eql('fg')
    })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
})