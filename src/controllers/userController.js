const asyncHandle = require('express-async-handler')

const getAllUsers = asyncHandle(async (req, res) => {
	const users = await UserModel.find({});

	const data = [];
	users.forEach((item) =>
		data.push({
			email: item.email ?? '',
			name: item.name ?? '',
			id: item.id,
		})
	);

	res.status(200).json({
		message: 'Get users successfully!!!',
		data,
	});
});

const getEventsFollowed = asyncHandle(async (req, res) => {
	const { uid } = req.query;

	if (uid) {
		const events = await EventModel.find({ followers: { $all: uid } });

		const ids = [];

		events.forEach((event) => ids.push(event.id));

		res.status(200).json({
			message: 'fafa',
			data: ids,
		});
	} else {
		res.sendStatus(401);
		throw new Error('Missing uid');
	}
});

const updateFcmToken = asyncHandle(async (req, res) => {
	const { uid, fcmTokens } = req.body;

	await UserModel.findByIdAndUpdate(uid, {
		fcmTokens,
	});

	res.status(200).json({
		message: 'Fcmtoken updated',
		data: [],
	});
});

const handleSendNotification = async ({
	token,
	title,
	subtitle,
	body,
	data,
}) => {
	var request = require('request');
	var options = {
		method: 'POST',
		url: 'https://fcm.googleapis.com/v1/projects/evenhub-f8c6e/messages:send',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await getAccessToken()}`,
		},
		body: JSON.stringify({
			message: {
				token,
				notification: {
					title,
					body,
					subtitle,
				},
				data,
			},
		}),
	};
	request(options, function (error, response) {
		if (error) throw new Error(error);
		console.log(error);

		console.log(response);
	});
};


module.exports = {
	getAllUsers,
	getEventsFollowed,
	updateFcmToken,
	handleSendNotification,
};
