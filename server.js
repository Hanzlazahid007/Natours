const dotEnv = require('dotenv');
const mongoose = require('mongoose');
dotEnv.config({ path: './config.env' });

const db =
  'mongodb+srv://hanzla:LtjLQW4Lwk3zgwVs@cluster0.sg6wdg2.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Db is succesfully conected'));

const app = require('./app');

app.listen(3000, () => console.log('server is running on port 3000'));
