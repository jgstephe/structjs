var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Hash', function() {
  var data = '01 02 03 04 71 77 65 72 61 73 64 66 7a 78 63 76 '
           + '61 61 62 62 63 63'
  
  var Dummy = new Struct({
    c: Struct.String(1),
    n: Struct.Uint8
  })
      
  var Test = new Struct({
    nums:    Struct.Array(Struct.Uint8, 4),
    strs:    Struct.Array(Struct.String(4), 3),
    structs: Struct.Hash(Dummy, 'c', 3)
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
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
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
    
    test('deletions should not effect length', function() {
      delete t.structs.b
      
      packed = new DataView(t.pack())
      packed.byteLength.should.equal(22)
      
      var expectation = utils.readData('01 02 03 04 71 77 65 72 61 73 64 66 7a 78 63 76 61 61 63 63 00 00')
      utils.compare(expectation, packed).should.be.ok
    })
    
    test('additions should not effect length', function() {
      t.structs.m = new Dummy({ c: 'm', n: '109' })
      t.structs.n = new Dummy({ c: 'n', n: '110' })
      
      packed = new DataView(t.pack())
      packed.byteLength.should.equal(22)
      
      var expectation = utils.readData('01 02 03 04 71 77 65 72 61 73 64 66 7a 78 63 76 61 61 63 63 6d 6d')
      utils.compare(expectation, packed).should.be.ok
    })
  })
})