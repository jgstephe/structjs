var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Number', function() {
  var Test = new Struct({
    version: Struct.Uint8
  })
  
  Test.conditional(function() {
    return this.version > 0
  }, {
    ext1: Struct.Uint8
  })
  
  Test.conditional(function() {
    return this.version > 1
  }, {
    ext2: Struct.String(3)
  })
  
  suite('Case (1)', function() {
    var data = '00'

    var t = new Test, input = utils.readData(data)
    t.unpack(input)

    test('Read', function() {
      t.version.should.eql(0)
      t.should.not.have.property('ext1')
      t.should.not.have.property('ext2')
    })

    test('Write', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
  
  suite('Case (2)', function() {
    var data = '01 2a'

    var t = new Test, input = utils.readData(data)
    t.unpack(input)

    test('Read', function() {
      t.version.should.eql(1)
      t.should.have.property('ext1', 42)
      t.should.not.have.property('ext2')
    })

    test('Write', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
  
  suite('Case (2)', function() {
    var data = '02 2a 61 73 64'

    var t = new Test, input = utils.readData(data)
    t.unpack(input)

    test('Read', function() {
      t.version.should.eql(2)
      t.should.have.property('ext1', 42)
      t.should.have.property('ext2', 'asd')
    })

    test('Write', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
  })
})