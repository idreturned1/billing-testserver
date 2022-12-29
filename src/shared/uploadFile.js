const multer = require('multer');
const path = require('path');
const util = require('util');
const fs = require('fs');

const getUploadFileMiddleware = (config) => {
  const resourcePath = '../../public/assets/';
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dirPath = path.join(__dirname, resourcePath, config.dirName, '/');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      cb(null, dirPath);
    },
    filename: (req, file, cb) => {
      const fileExtension = file.originalname.split('.').pop();
      cb(null, `${config.fileName}.${fileExtension}`);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024,
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(config.fileFilter)) {
        cb(new Error('Invalid file format.'));
      }
      cb(undefined, true);
    },
  });
  return util.promisify(upload.single(config.propertyName));
};

module.exports = getUploadFileMiddleware;
