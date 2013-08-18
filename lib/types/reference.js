var StructReference = module.exports = function(prop) {
  this.prop = prop
}

StructReference.prototype.get = function(parent) {
  return parent[this.prop]
}