function filter (f, stat) {
  console.log(f.indexOf('/dist/api/') >= 0)
  return f.indexOf('/dist/api/') >= 0
}

module.exports = filter
