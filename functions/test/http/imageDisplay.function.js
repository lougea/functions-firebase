const functions = require('firebase-functions')
const os = require('os')
const path = require('path')
const axios = require('axios')
const sharp = require('sharp')
const mkdirp = require('mkdirp-promise')

exports = module.exports = functions.https.onRequest(async (req, res) => {
  const url = req.query.url
  const file = path.join(os.tmpdir(), 'file.jpg')
  const response = await axios({
    url: url,
    method: 'get',
    responseType: 'arraybuffer'
  })
  const dirnameTest = path.extname(file)
  console.log(dirnameTest)
  const buffer = Buffer.from(response.data)
  await sharp(buffer)
    .resize(400, 300)
    .rotate(120)
    .blur(1.4)
    .greyscale(true)
    .modulate({ hue: 20 })
    .negate(false)
    // .linear(2, 4)
    // .threshold()
    .toFile(file)

  res.sendFile(file)
})
