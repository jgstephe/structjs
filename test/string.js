var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('String', function() {
  var data = '4f 66 66 73 65 74 3a 0e 00 00 00 00 00 00 13 27'

  var Test = new Struct({
    str:    Struct.String(7),
    offset: Struct.Uint8,
    result: Struct.String({
      length: 1, size: 2, littleEndian: true,
      storage: true
    }),
    storage: Struct.Storage('result', Struct.Ref('offset'))
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('String',  function() { t.str.should.eql('Offset:') })
    test('Offset',  function() { t.offset.should.eql(0xe)    })
    test('Storage', function() { t.result.should.eql('✓')    })
  })
  
  suite('Write', function() {
    var packed
    setup(function() {
      packed = new DataView(t.pack())
    })
    
    test('Size', function() {
      packed.byteLength.should.eql(10)
    })

    test('String', function() {
      utils.readString(packed, 0, 7).should.eql('Offset:')
    })

    test('Offset', function() {
      packed.getUint8(7).should.eql(8)
    })

    test('Storage', function() {
      String.fromCharCode(packed.getUint16(8, true)).should.eql('✓')
    })
  })
})