const asyncHandle = require('express-async-handler');

const calcDistanceLocation = ({
	currentLat,
	currentLong,
	addressLat,
	addressLong,
}) => {
	const r = 6371;
	const dLat = toRoad(addressLat - currentLat);
	const dLon = toRoad(addressLong - currentLong);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) *
			Math.sin(dLon / 2) *
			Math.cos(toRoad(currentLat)) *
			Math.cos(toRoad(addressLat));
	return r * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const toRoad = (val) => (val * Math.PI) / 180;

const addNewEvent = asyncHandle(async (req, res) => {
	const body = req.body;

	if (body) {
		const newEvent = new EventModel(body);

		await newEvent.save();

		res.status(200).json({
			message: 'Add new Event successfully!!!',
			data: newEvent,
		});
	} else {
		res.status(401);
		throw new Error('Event data not found!!!');
	}
});

const getEventById = asyncHandle(async (req, res) => {
	const { id } = req.query;

	const item = await EventModel.findById(id);

	res.status(200).json({
		message: 'Event detail',
		data: item ? item : [],
	});
});

const getEvents = asyncHandle(async (req, res) => {
	const { lat, long, distance, limit, date } = req.query;

	const events = await EventModel.find({})
		.sort({ createdAt: -1 })
		.limit(limit ?? 0);

	if (lat && long && distance) {
		const items = [];
		if (events.length > 0) {
			events.forEach((event) => {
				const eventDistance = calcDistanceLocation({
					currentLong: long,
					currentLat: lat,
					addressLat: event.position.lat,
					addressLong: event.position.long,
				});

				if (eventDistance < distance) {
					items.push(event);
				}
			});
		}

		res.status(200).json({
			message: 'get events ok',
			data: date
				? items.filter((element) => element.date > new Date(date))
				: items,
		});
	} else {
		res.status(200).json({
			message: 'get events ok',
			data: date
				? events.filter((element) => element.date > new Date(date))
				: events,
		});
	}
});

const updateFollowers = asyncHandle(async (req, res) => {
	const body = req.body;
	const { id, followers } = body;

	await EventModel.findByIdAndUpdate(id, { followers, updatedAt: Date.now() });

	res.status(200).json({
		mess: 'Update followers successfully!',
		data: [],
	});
});

const getFollowers = asyncHandle(async (req, res) => {
	const { id } = req.query;

	const event = await EventModel.findById(id);

	if (event) {
		res.status(200).json({
			mess: 'Followers',
			data: event.followers ?? [],
		});
	} else {
		res.status(401);
		throw new Error('Event not found');
	}
});

module.exports = {
	addNewEvent,
	getEventById,
	getEvents,
	updateFollowers,
	getFollowers,
};
