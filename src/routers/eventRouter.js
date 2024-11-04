const Router = require('express');

const eventRouter = Router();
const {
	addNewEvent,
	getEvents
} = require('../controllers/eventController');

eventRouter.post('/add-new', addNewEvent);
eventRouter.get('/get-events', getEvents);


module.exports = eventRouter;
