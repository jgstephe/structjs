var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('String', function() {
  var data = '00 54 00 65 00 73 00 74 00 0a 4f 66 66 73 65 74 '
           + '3a 18 00 00 00 00 00 00 13 27'

  var Test = new Struct({
    title:  Struct.String({ length: 5, size: 2 }),
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
    test('Title',   function() { t.title.should.eql('Test\n') })
    test('String',  function() { t.str.should.eql('Offset:') })
    test('Offset',  function() { t.offset.should.eql(0x18)    })
    test('Storage', function() { t.result.should.eql('✓')    })
  })
  
  suite('Write', function() {
    var packed
    setup(function() {
      packed = new DataView(t.pack())
    })
    
    test('Size', function() {
      packed.byteLength.should.eql(20)
    })

    test('Title', function() {
      var bytes = []
      for (var i = 0; i < 5; ++i) bytes.push(packed.getUint16(i * 2))
      String.fromCharCode.apply(String, bytes).should.eql('Test\n')
    })

    test('String', function() {
      utils.readString(packed, 10, 17).should.eql('Offset:')
    })

    test('Offset', function() {
      packed.getUint8(17).should.eql(18)
    })

    test('Storage', function() {
      String.fromCharCode(packed.getUint16(18, true)).should.eql('✓')
    })
  })
})