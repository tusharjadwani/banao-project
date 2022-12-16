try {
    const express = require('express');
    const connectToDb = require('./db');
    const app = express();
    const cors = require('cors');
    const path = require('path')
    app.use(cors());
    const dotenv = require('dotenv')
    dotenv.config({ path: './config.env' });
    const port = process.env.PORT || 3000;
    const mongoURI = process.env.MONGO || "mongodb+srv://tushar:Bf9Z7Lgqw8xcTA0x@cluster0.3zsfvdw.mongodb.net/banao";

    app.use(express.static(path.join(__dirname, './client/build')))

    connectToDb();
    app.use(express.json())

    app.get('/', (req, res) => {
        res.status(404).send("Forbidden");
    })
    
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/data', require('./routes/data'));

    app.listen(port, () => {
        console.log(`listening on port ${port}`);
    })
} catch (error) {
    console.log(error.message);
}