var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Reference (Array Count)', function() {
  var data = '04 01 02 03 04'
           
  var Test = new Struct({
    count: Struct.Uint8,
    nums:  Struct.Array(Struct.Uint8, Struct.Ref('count'))
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('Count', function() {
      t.count.should.equal(4)
    })

    test('Array of dynamic Length', function() {
      t.nums.should.have.lengthOf(4)
      t.nums.should.include(1, 2, 3, 4)
    })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
    
    test('deletions should be re-mapped properly', function() {
      t.nums.shift()
      t.nums.pop()
      packed = new DataView(t.pack())
      packed.byteLength.should.equal(3)
      packed.getUint8(0).should.equal(2)
      packed.getUint8(1).should.equal(2)
      packed.getUint8(2).should.equal(3)
    })
    
    test('additions should be re-mapped properly', function() {
      t.nums.push(42)
      packed = new DataView(t.pack())
      packed.byteLength.should.equal(4)
      packed.getUint8(0).should.equal(3)
      packed.getUint8(1).should.equal(2)
      packed.getUint8(2).should.equal(3)
      packed.getUint8(3).should.equal(42)
    })
  })
})


suite('Reference (Hash Count)', function() {
  var data = '04 01 02 03 04'
  
  var Dummy = new Struct({
    n: Struct.Uint8
  })     
  
  var Test = new Struct({
    count: Struct.Uint8,
    nums:  Struct.Hash(Dummy, 'n', Struct.Ref('count'))
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('Count', function() {
      t.count.should.equal(4)
    })

    test('Array of dynamic Length', function() {
      t.nums.should.have.keys(['1', '2', '3', '4'])
    })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
    
    test('deletions should be re-mapped properly', function() {
      delete t.nums['1']
      delete t.nums['3']

      packed = new DataView(t.pack())
      packed.byteLength.should.equal(3)
      packed.getUint8(0).should.equal(2)
      packed.getUint8(1).should.equal(2)
      packed.getUint8(2).should.equal(4)
    })
    
    test('additions should be re-mapped properly', function() {
      t.nums[42] = new Dummy({ n: 42 })
      
      packed = new DataView(t.pack())
      packed.byteLength.should.equal(4)
      packed.getUint8(0).should.equal(3)
      packed.getUint8(1).should.equal(2)
      packed.getUint8(2).should.equal(4)
      packed.getUint8(3).should.equal(42)
    })
  })
})