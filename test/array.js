var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Array', function() {
  var data = '01 02 03 04 71 77 65 72 61 73 64 66 7a 78 63 76 '
           + '61 61 62 62 63 63'
  
  var Test = new Struct({
    nums:    Struct.Array(Struct.Uint8, 4),
    strs:    Struct.Array(Struct.String(4), 3),
    structs: Struct.Array(new Struct({
      c: Struct.String(1),
      n: Struct.Uint8
    }), 3)
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)

  suite('Read', function() {
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
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
})