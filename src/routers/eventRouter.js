const Router = require('express');

const eventRouter = Router();
const {
	addNewEvent,
} = require('../controllers/eventController');

eventRouter.post('/add-new', addNewEvent);

module.exports = eventRouter;
