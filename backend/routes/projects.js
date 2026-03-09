const express = require('express');
const { body } = require('express-validator');
const { getAll, getOne, create, update, remove, getClients } = require('../controllers/projectController');
const { verifyToken, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/clients', restrictTo('admin'), getClients);
router.get('/', getAll);
router.get('/:id', getOne);

router.post('/', restrictTo('admin'), [
  body('project_name').trim().notEmpty().withMessage('Project name is required'),
], create);

router.put('/:id', restrictTo('admin'), update);
router.delete('/:id', restrictTo('admin'), remove);

module.exports = router;
