const express = require('express');
const { getByProject, upload: uploadDoc, download, remove } = require('../controllers/documentController');
const { verifyToken, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(verifyToken);

router.get('/', getByProject);
router.post('/', upload.single('file'), uploadDoc);
router.get('/:id/download', download);
router.delete('/:id', restrictTo('admin'), remove);

module.exports = router;
