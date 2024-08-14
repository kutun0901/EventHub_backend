const express = require('express')
const cors = require('cors')
const authRouter = require('./src/routers/authRouter');
const connectDB = require('./src/configs/connectdb');
const errorMiddlewareHandler = require('./src/middleware/errorMiddleware');
const userRouter = require('./src/routers/userRouter');
const verifyToken = require('./src/middleware/verifyMiddleware');
const eventRouter = require('./src/routers/eventRouter');

const app = express();
require('dotenv').config();

app.use(cors())

// middleware that parses incoming requests with JSON payloads.
app.use(express.json())

const PORT = 3001;

app.use('/auth', authRouter);
// app.use(verifyToken)
app.use('/user',verifyToken, userRouter);
app.use('/event',verifyToken, eventRouter);


connectDB();

app.use(errorMiddlewareHandler);

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
        return;
    }

    console.log(`Server is starting at http://localhost:${PORT}`);
})
