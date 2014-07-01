var express = require('express');
var router = express.Router();

router.get('/:index/:filter', a.studentController.findByIndex.bind(a.studentController));
router.get('', a.studentController.findAll.bind(a.studentController));
router.post('', a.studentController.insert.bind(a.studentController));
router.put('', a.studentController.update.bind(a.studentController));
router.delete('/:id/:creationDate', a.studentController.delete.bind(a.studentController));

module.exports = router;