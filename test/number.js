var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Number', function() {
  var data = '42 42 0a cd de ad 0a cd fa ce fe ed fa ce 4f 5e '
           + 'ad 00 43 eb d5 b7 dd f9 5f d7'
         
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

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('Int8',    function() { t.Int8.should.eql(0x42)                  })
    test('UInt8',   function() { t.UInt8.should.eql(0x42)                 })
    test('Int16',   function() { t.Int16.should.eql(0xacd)                })
    test('UInt16',  function() { t.UInt16.should.eql(0xdead)              })
    test('Int32',   function() { t.Int32.should.eql(0xacdface)            })
    test('UInt32',  function() { t.UInt32.should.eql(0xfeedface)          })
    test('Float32', function() { t.Float32.should.eql(0xdead0000)         })
    test('Float64', function() { t.Float64.should.eql(0xdeadbeefcafebabe) })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
})