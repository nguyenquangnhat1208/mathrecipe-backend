

const gc = require('../common/helper');
const bucket = gc.bucket('file_save');// should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

exports.uploadImage = (file) => new Promise((resolve, reject) => {
    const { originalname, buffer } = file
    var filename = Date.now() + "-" + originalname.replace(/ /g, "_");
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
        resumable: false
    })
    blobStream.on('finish', () => {
        // const publicUrl = format(
        //     `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        // )
        resolve({ url: `https://storage.googleapis.com/${bucket.name}/${blob.name}`, name: filename })
    })
        .on('error', () => {
            reject(`Unable to upload image, something went wrong`)
        })
        .end(buffer)
})

exports.deleteImage = (name) => {
    const blob = bucket.file(name);
    blob.delete((err, result) => {
        if (err) console.log(err);
    });
}