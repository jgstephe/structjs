!function(exports, chai) {
  chai.should()
  
  exports.readData = function(hex) {
    var bytes = hex.split(' '), view = new DataView(new ArrayBuffer(bytes.length))
    bytes.forEach(function(byte, i) {
      view.setUint8(i, parseInt(byte, 16))
    })
    return view
  }
  
  exports.readString = function(view, from, to) {
    var str = []
    for (var i = from; i < to; ++i)
      str.push(view.getUint8(i))
    return String.fromCharCode.apply(null, str)
  }
  
  exports.compare = function(lhs, rhs) {
    if (lhs.byteLength !== rhs.byteLength) return false
    for (var i = 0, len = lhs.byteLength; i < len; ++i) {
      if (lhs.getUint8(i) !== rhs.getUint8(i)) return false
    }
    return true
  }

}(typeof exports === 'undefined' ? this.utils = {} : exports, typeof exports === 'undefined' ? this.chai : require('chai'))