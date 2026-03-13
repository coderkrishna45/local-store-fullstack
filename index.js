const express = require('express');
const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);

const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(morgan('dev'));
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use('/products',productRoutes);

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use(errorHandler);
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}/products`);
})