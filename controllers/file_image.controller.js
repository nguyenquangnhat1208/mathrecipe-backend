const storageImage_s3 = require('../middleware/aws_cloud_storage');
const sharp = require('sharp');

// const path = require('path');
// const Jimp = require("jimp")
// const shell = require('shelljs');
exports.uploadSingleImageLocal = (req, res) => {
  storageImage_s3.uploadSingleImageLocal(req, res, (err) => {
    if (!err) {
      sharp(req.file.path).resize(200, 200).toFile(process.env.PATH_IMAGE + `${req.params.bible_verses}/thumbnails-${req.file.originalname}`, (err, resizeImage) => {
        if (err) {
          console.log(err);
        } else {
          console.log(resizeImage);
        }
      });
      if (req.file !== undefined) {

        res.status(200).json({
          msg: 'Upload image success !',
          data: process.env.PATH_IMAGE + `${req.params.bible_verses}/${req.file.filename}`,
          thumbnail: process.env.PATH_IMAGE + `${req.params.bible_verses}/thumbnails-${req.file.originalname}`
        })
      } else {
        res.status(500).json({
          msg: 'Upload image fail !',
          code: 'ERR_403_UPLOAD_FILE'
        })
      }
    } else {
      res.status(200).json({ status: false, msg: err, code: 'ERR_403_UPLOAD_FILE' });
    }
  });
}



exports.uploadSingleImageCloud = (req, res) => {
  storageImage_s3.uploadSingleImageLocal(req, res, (err) => {
    if (!err) {
      sharp(req.file.path).resize(200, 200).toFile(process.env.PATH_IMAGE + `${req.params.bible_verses}/thumbnails-${req.file.originalname}`, (err, resizeImage) => {
        if (err) {
          console.log(err);
        } else {
          console.log(resizeImage);
        }
      });
      if (req.file !== undefined) {

        res.status(200).json({
          msg: 'Upload image success !',
          data: process.env.PATH_IMAGE + `${req.params.bible_verses}/${req.file.filename}`,
          thumbnail: process.env.PATH_IMAGE + `${req.params.bible_verses}/thumbnails-${req.file.originalname}`
        })
      } else {
        res.status(500).json({
          msg: 'Upload image fail !',
          code: 'ERR_403_UPLOAD_FILE'
        })
      }
    } else {
      res.status(200).json({ status: false, msg: err, code: 'ERR_403_UPLOAD_FILE' });
    }
  });
}