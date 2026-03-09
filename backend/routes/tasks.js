const express = require('express');
const { getByProject, create, update, remove } = require('../controllers/taskController');
const { verifyToken, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', getByProject);
router.post('/', restrictTo('admin'), create);
router.put('/:id', update);
router.delete('/:id', restrictTo('admin'), remove);

module.exports = router;
