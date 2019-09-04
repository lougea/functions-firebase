const functions = require('firebase-functions');
const fse = require('fs-extra')
const path = require('path');
const os = require('os');
const sharp = require('sharp')
const {Storage} = require('@google-cloud/storage');
const gcs = new Storage()

// const admin = require('firebase-admin');
// admin.initializeApp();

exports = module.exports = functions.storage.object().onFinalize(async (object) => {
  const bucket = gcs.bucket(object.bucket)
  const filePath = object.name
  const fileName = filePath.split('/').pop()
  const bucketDir = path.dirname(filePath)

  const workingDir = path.join(os.tmpdir(), 'thumbs')
  const tmpFilePath = path.join(workingDir, 'source.png')

  if(fileName.includes('thumb@') || !object.contentType.includes('image') ){
    console.log('end function')
    return false
  }

  await fse.ensureDir(workingDir)
  await bucket.file(filePath).download({
    destination: tmpFilePath
  })

  const sizes =[64, 128, 256]
  const uploadPromises = sizes.map(async size => {
    const thumbName = `thumb@${size}_${fileName}`
    const thumbPath = path.join(workingDir, thumbName)

    await sharp(tmpFilePath).resize(size,size).toFile(thumbPath)

    return bucket.upload(thumbPath, {
      destination: path.join(bucketDir, thumbName)
    });
  });
  await Promise.all(uploadPromises)
  return fse.remove(workingDir)
  })
 
