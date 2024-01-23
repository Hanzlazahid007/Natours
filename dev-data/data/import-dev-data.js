var fs = require('fs');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
dotEnv.config({ path: './config.env' });
const Tour = require('../../model/tourmodel');

const db =
  'mongodb+srv://hanzla:UQLiLh7scevg491E@cluster0.sg6wdg2.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Db is succesfully conected'));

const tour = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Tour.create(tour);
    console.log('Data succesfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();

    console.log('data succesfully dleeted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

importData();
// deleteData();
