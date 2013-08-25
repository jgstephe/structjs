var Struct = Struct || require('../lib/struct')
  , utils = utils || require('./utils')

suite('Storage (String)', function() {
  var data = '03 08 01 00 04 01 02 05 61 62 63 64 65 66 67'
  
  var Record = new Struct({
    length:     Struct.Uint8,
    offset:     Struct.Uint8,
    string:     Struct.String({
      storage:  true,
      offset:   Struct.Ref('offset'),
      length:   Struct.Ref('length')
    })
  })
  
  var Test = new Struct({
    count:        Struct.Uint8,
    stringOffset: Struct.Uint8,
    records:      Struct.Array(Record, Struct.Ref('count')),
    names:        Struct.Storage('records.string', Struct.Ref('stringOffset'))
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
    
    test('deletions should be re-mapped properly', function() {
      t.records.shift()
      packed = new DataView(t.pack())
      
      packed.byteLength.should.equal(12)
      packed.getUint8(0).should.equal(2)
      packed.getUint8(1).should.equal(6)
      
      // Record 0
      packed.getUint8(2).should.equal(4)
      packed.getUint8(3).should.equal(0)
      
      // Record 1
      packed.getUint8(4).should.equal(2)
      packed.getUint8(5).should.equal(4)
      
      utils.readString(packed, 6, 10).should.eql('bcde')
      utils.readString(packed, 10, 12).should.eql('fg')
    })
    
    test('additions should be re-mapped properly', function() {
      t.records.push(new Record({ string: 'done' }))
      packed = new DataView(t.pack())
      
      packed.byteLength.should.equal(18)
      packed.getUint8(0).should.equal(3)
      packed.getUint8(1).should.equal(8)
      
      // Record 0
      packed.getUint8(2).should.equal(4)
      packed.getUint8(3).should.equal(0)
      
      // Record 1
      packed.getUint8(4).should.equal(2)
      packed.getUint8(5).should.equal(4)
      
      // Record 2
      packed.getUint8(6).should.equal(4)
      packed.getUint8(7).should.equal(6)
      
      utils.readString(packed, 8, 12).should.eql('bcde')
      utils.readString(packed, 12, 14).should.eql('fg')
      utils.readString(packed, 14, 18).should.eql('done')
    })
  })
})

suite('Storage (Nested)', function() {
  var data = '02 03 08 04 74 62 6c 31 06 74 62 6c 32'
  
  var Table = new Struct({
    format: Struct.Uint8,
    name:   Struct.String(4)
  }, { storage: true, offset: Struct.Ref('offset') })
  var Sub = new Struct({
    offset: Struct.Uint8,
    format: Struct.Uint8.from(Struct.Ref('offset')),
    table:  Table
  })
  var Test = new Struct({
    count:  Struct.Uint8,
    subs:   Struct.Array(Sub, Struct.Ref('count')),
    tables: Struct.Storage('subs.table')
  })

  var t = new Test, input = utils.readData(data)
  t.unpack(input)
  
  suite('Read', function() {
    test('count', function() {
      t.count.should.eql(2)
    })
    test('records', function() {
      t.subs.should.have.lengthOf(2)
      t.subs[0].offset.should.equal(3)
      t.subs[0].format.should.equal(4)
      t.subs[0].table.format.should.equal(4)
      t.subs[0].table.name.should.equal('tbl1')
      t.subs[1].offset.should.equal(8)
      t.subs[1].format.should.equal(6)
      t.subs[1].table.format.should.equal(6)
      t.subs[1].table.name.should.equal('tbl2')
    })
  })
  
  suite('Write', function() {
    test('should be equal', function() {
      var packed = new DataView(t.pack())
      utils.compare(input, packed).should.be.ok
    })
    
    test('deletions should be re-mapped properly', function() {
      t.subs.shift()
      packed = new DataView(t.pack())
    
      packed.byteLength.should.equal(7)
      packed.getUint8(0).should.equal(1)
    
      // Record 0
      packed.getUint8(1).should.equal(2)
      packed.getUint8(2).should.equal(6)
      utils.readString(packed, 3, 7).should.eql('tbl2')
    })
    
    test('additions should be re-mapped properly', function() {
      t.subs.push(new Sub({ table: new Table({
        format: 10,
        name:   'tbl3'
      })}))
      packed = new DataView(t.pack())
      
      packed.byteLength.should.equal(13)
      packed.getUint8(0).should.equal(2)
    
      // Record 0
      packed.getUint8(1).should.equal(3)
      
      // Record 1
      packed.getUint8(2).should.equal(8)
      
      // Table 0
      packed.getUint8(3).should.equal(6)
      utils.readString(packed, 4, 8).should.eql('tbl2')
      
      // Table 1  
      packed.getUint8(8).should.equal(10)
      utils.readString(packed, 9, 13).should.eql('tbl3')
    })
  })
})