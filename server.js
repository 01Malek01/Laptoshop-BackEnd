const mongoose = require('mongoose');
const app = require('./app')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);
const localDB = process.env.LOCAL_DB;

//for connecting to database
mongoose.connect(DB)
.then(() => {
  console.log('DB connection successful!');
}).catch(err => {
  console.log('connection failed',err);
});

//for starting server
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});