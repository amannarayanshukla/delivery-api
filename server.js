require('dotenv').config({ path: './config/.env' });

const express = require('express');
const db = require('./config/db');
const router = require('./routes/search');
const {handleError} = require('./utils/errorHandler');
const app = express();
const port = process.env.PORT;

// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
//
// const ProductSchema = new Schema({}, { strict: false });
// const Product = mongoose.model('Product', ProductSchema, 'products');
//
// const CategorySchema = new Schema({}, { strict: false });
// const Category = mongoose.model('Category', CategorySchema, 'categories');

app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api/v1', router);
app.use((err, req, res, next) => {
    handleError(err, res);
});
// app.get('/product', (req, res) => {
//     console.log(Product.find({}, function (err, docs) {
//         if (!err) {
//             console.log(docs);
//             process.exit();
//         } else {
//             throw err;
//         }
//     }));
//     res.send('done');
// });
// app.get('/categories', (req, res) => {
//     console.log(Category.find({}, function (err, docs) {
//         if (!err) {
//             console.log(docs);
//             process.exit();
//         } else {
//             throw err;
//         }
//     }));
//     res.send('done');
// });
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
