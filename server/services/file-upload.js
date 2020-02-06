const aws              = require("aws-sdk")
const multer           = require("multer")
const multerS3         = require("multer-s3")
const awsconfig        = require("../awsconfig")
aws.config.update(awsconfig)

const s3 = new aws.S3();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
}

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: 'aquariumpardata',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: 'TESTING_META_DATA!' });
        },
        key: function (req, file, cb) {
            cb(null, `${req.body.fixture}_${req.body.url_id}_${Date.now().toString()}.jpg`)
        }
    })
})

const deleteImages = async ({ key }) => {
    var params = {
        Bucket: 'aquariumpardata',
        Key: `${key}`
    }
    await s3.deleteObject(params, function (err, data) {
        if(!err) {
            // console.log(data)
        } else {
            console.log(err);
        }
    })
}

module.exports = {
    upload,
    deleteImages
}