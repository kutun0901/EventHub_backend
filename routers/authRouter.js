const Router = require('express')

const authRouter = Router();

authRouter.post('/register', (_req, res) => {
    console.log(res.body);
    res.send('')
})

module.exports = authRouter;
