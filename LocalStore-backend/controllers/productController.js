const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const getAllProducts = async(req,res,next)=>{
    try{
        const{name,minPrice} = req.query;
        let query = knex('products as p').join('inventory as i','p.id','i.product_id').select('p.id','p.name','p.price','p.description','i.quantity').orderBy('p.id','asc');
        if(name){
            query.where('p.name','ilike',`%${name}%`);
        }
        if(minPrice){
            query = query.where('p.price','>=',minPrice);
        }
        const result = await query;
        res.json(result);
    }catch(error){
        next(error);
    }
};
const getProductById = async (req, res, next) => {
    const { id } = req.params;
    
    if (isNaN(id)) {
        res.status(400);
        return next(new Error("Invalid Product ID"));
    }

    try {
        const product = await knex('products as p')
            .join('inventory as i', 'p.id', 'i.product_id')
            .select('p.id', 'p.name', 'p.price', 'p.description', 'i.quantity')
            .where('p.id', id)
            .first(); // .first() gives us the object directly instead of an array

        if (!product) {
            res.status(404);
            return next(new Error("Product not found"));
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};
const createProduct = async (req, res,next) => {
    const { name, price, quantity } = req.body;
    
    try {
        const [newProduct] = await knex('products')
            .insert({ name, price })
            .returning('*');

        await knex('inventory').insert({
            product_id: newProduct.id,
            quantity: quantity || 0
        });

        res.status(201).json({ ...newProduct, quantity });
        
    } catch (error) {
        next();
    }

};
const updateProduct = async(req, res , next) => {
    const { price, quantity } = req.body;
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json("enter valid id");
    }

    const trx = await knex.transaction();
    try {
        if (price !== undefined && price >= 0) {
            await trx('products').where({ id }).update({ price });
        }
        if (quantity !== undefined && quantity >= 0) { 
            await trx('inventory').where({ product_id: id }).update({ quantity });
        }
        
        await trx.commit();
        return res.json({ success: true });
    } catch (error) {
       next(error);
    }
};
// In productController.js
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    try {
        const deletedCount = await knex('products').where({ id }).del();
        if (deletedCount === 0) return res.status(404).json({ error: "Not found" });
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
module.exports={
    getAllProducts,getProductById,createProduct,updateProduct,deleteProduct
};