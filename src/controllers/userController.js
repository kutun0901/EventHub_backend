

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

	await handleSendNotification();

	res.status(200).json({
		message: 'Get users successfully!!!',
		data,
	});
});


module.exports = {
	getAllUsers,
};
