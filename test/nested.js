var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Nested', function() {
  var data = '01 04 66 75 62 61 72'
  
  var Nested = new Struct({
    format: Struct.Int8,
    name:   Struct.String(5)
  })
  var Test = new Struct({
    id:     Struct.Int8,
    nested: Nested
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('parent', function() {
      t.id.should.eql(1)
    })
    test('nested', function() {
      t.nested.format.should.eql(4)
      t.nested.name.should.eql('fubar')
    })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
})