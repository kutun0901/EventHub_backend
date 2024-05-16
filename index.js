const express = require('express')
const cors = require('cors')

const app = express();
app.use(cors())

const PORT = 3001;

app.listen(PORT, (err) => {
    if (err) {
        console.log(err)
        return;
    }

    console.log(`Server is starting at http://localhost:${PORT}`);
})
