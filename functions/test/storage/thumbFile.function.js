const functions = require('firebase-functions');
const fse = require('fs-extra')
const path = require('path');
const os = require('os');
const sharp = require('sharp')
const admin = require('firebase-admin');
const DB = admin.firestore()
const storage = admin.storage()

const CDN_URL = 
'https://storage.cloud.google.com/tappable-louise.appspot.com/'


exports = module.exports = functions.storage.object().onFinalize(async (object) => {
  const bucket = storage.bucket(object.bucket)
  const filePath = object.name
  const fileName = filePath.split('/').pop()
  const bucketDir = path.dirname(filePath)
  const workingDir = path.join(os.tmpdir(), 'thumbs')
  const tmpFilePath = path.join(workingDir, fileName)

  const uid = filePath.split('/')[1]


  if(fileName.includes('thumb@') || !object.contentType.includes('image') ){
    console.log('end function')
    return false
  }
  await fse.ensureDir(workingDir)
  await bucket.file(filePath).download({
    destination: tmpFilePath
  })

  const sizes =[64,120]
  const uploadPromises = sizes.map(async size => {
    const thumbName = `thumb@${size}_${fileName}`
    const thumbPath = path.join(workingDir, thumbName)

    await sharp(tmpFilePath).resize(size,size).toFile(thumbPath)

    return bucket.upload(thumbPath, {
      destination: path.join(bucketDir, thumbName)
    });
  
  });
  const res = await Promise.all(uploadPromises)
  // File path Url - @64 @120
  const filePath64 = res[0][0].name
  const filePath120 = res[1][0].name
 
  // Url @64 @120
  const url_64= `${CDN_URL}${filePath64}`
  const url_120= `${CDN_URL}${filePath120}`
 
  // Update firestore with url @64 @120
  await DB.collection('users')
  .doc(uid)
  .update({
    Url64: url_64,
    Url120: url_120
  })

  // Delete temp dir
  return fse.remove(workingDir)
  })
 
