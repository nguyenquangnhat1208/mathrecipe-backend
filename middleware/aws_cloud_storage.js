const multer = require('multer');
// const aws = require('aws-sdk');
// const multerS3 = require('multer-s3');
const fs = require('fs');
const path = require('path');
//=================S3=============================
// const s3 = new aws.S3({
//   accessKeyId: constants.ACCESS_KEY_ID_S3,
//   secretAccessKey: constants.SECRET_ACCESS_KEY_S3,
//   Bucket: constants.BUCKET_S3
// });

// // storage image S3
// const storage = multerS3({
//   s3: s3,
//   bucket: constants.BUCKET_S3,
//   acl: 'public-read',
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   // metadata: function (req, file, cb) {
//   // 	cb(null, {fieldName: file.fieldname});
//   //   },
//   key: function (req, file, cb) {
//     // cb(null, path.basename(file.originalname))
//     var newFileName = file.originalname;
//     var fullPath = 'images/' + newFileName;
//     cb(null, fullPath);
//   }
// });
// exports.uploadSingleImage = multer({
//   storage: storage,
//   limits: { fileSize: constants.MAX_SIZE_ICON * 1024 * 1024 }, // In bytes:1 MB
//   fileFilter: function (req, file, cb) {
//     helpers.checkFileIsImage(file, cb);
//   }
// }).single('single_image');

//================localhost===================
// storage image local
const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    let bible_verses = String(req.params.folder);
    // const uploadDir = process.env.ENVIRONMENT === 'dev' ? path.join(__dirname, '..', '..', 'media', `${bible_verses}`) : process.env.PATH_IMAGE + `${bible_verses}`;
    const uploadDir = process.env.PATH_IMAGE + `${bible_verses}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      cb(null, uploadDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    let f = file.originalname.split(".");
    let filename = `${f[0]}-${Date.now()}.${f[1]}`;
    cb(null, filename);
  }
});
exports.uploadSingleImageLocal = multer({
  storage: storageImage,
  limits: { fileSize: 2 * 1024 * 1024 }, //2MB
  fileFilter: function (req, file, cb) {
    checkFileIsImage(file, cb);
  }
}).single('single_image');

//storage document local
// const storageDocument = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, `./imports`);
//   },
//   filename: (req, file, cb) => {
//     cb(null, String(file.originalname).toLowerCase());
//   }
// });
// exports.importDocumentLocal = multer({
//   storage: storageDocument,
//   limits: { fileSize: constants.MAX_SIZE_EACH_UPLOAD * 1024 * 1024 }, // 20MB
//   fileFilter: function (req, file, cb) {
//     helpers.checkfileIsZip(file, cb);
//   }
// }).single('document');

function checkFileIsImage(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
var constants = {
  MAX_SIZE_ICON: 2,
}