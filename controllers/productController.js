const knexConfig = require('../knexfile.js');
const knex = require('knex')(knexConfig.development);

const getAllProducts = async(req,res)=>{
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
        console.error("Database Error:", error.message);
        res.status(500).json({ error: "Failed to fetch products from database" });
    }
};
const createProduct = async(req,res)=>{
    const{name,description,price,quantity} = req.body;
    if(!name || !price || price<=0){
        return res.status(400).send("please enter valid details");
    }
    const trx =await knex.transaction();
    try{
        const[product]=await trx('products').insert({name,description,price}).returning('*');
        await trx('inventory').insert({product_id:product.id,quantity:quantity||0});
        await trx.commit();
        res.status(201).json({success:true});
    }catch(error){
        await trx.rollback();
        return res.status(500).json({error:error.message});
    }
};
const updateProduct = async (req, res) => {
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
        await trx.rollback();
        return res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
};
module.exports={
    getAllProducts,createProduct,updateProduct,deleteProduct
};