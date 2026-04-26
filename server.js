require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

const rateRoute = require('./routes/rate');
app.use('/api', rateRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('flaunt.fit server running on port ' + PORT);
});