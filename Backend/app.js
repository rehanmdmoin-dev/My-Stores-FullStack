require('dotenv').config()
const express = require('express');
const ConnectDB = require('./app/config/db')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
ConnectDB();
const app = express();

// Cors
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Helmet
app.use(helmet());

app.use(express.json());


const authRoute = require('./app/routes/api/authRoute');
app.use('/api', authRoute);
const productRoute = require('./app/routes/api/productRoute');
app.use('/api', productRoute);




const PORT = process.env.PORT


app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`server is running on port http://localhost:${PORT}`);
    }
})