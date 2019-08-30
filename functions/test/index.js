const glob = require('glob')
const camelcase = require('camelcase')

// Get functions group
const group = __dirname.split('/').pop()

// Get all functions in group
const files = glob.sync('./**/*.function.js', {
  cwd: __dirname,
  ignore: './node_modules/**'
})

// Export the functions
for (let f = 0, fl = files.length; f < fl; f++) {
  const file = files[f]
  const functionName = camelcase(
    file
      .slice(0, -12)
      .split('/')
      .join('_')
  )
  if (
    !process.env.FUNCTION_NAME ||
    process.env.FUNCTION_NAME === group + '-' + functionName
  ) {
    exports[functionName] = require(file)
  }
}
