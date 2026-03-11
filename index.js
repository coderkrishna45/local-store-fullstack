const express = require('express');
const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/products',async(req,res)=>{
    try{
        const {name,minPrice} = req.query;
        let query =  knex('products as p').join('inventory as i','p.id','i.product_id').select('p.id','p.name','i.quantity','p.description','p.price').orderBy('p.id','asc');
        if(name){
            query.where('p.name', 'ilike', `%${name}%`);
        }
        if (minPrice) {
            query = query.where('p.price', '>=', minPrice);
        }
        const result = await query;
        res.json(result);
    }catch(error){
        console.error("Database Error:", error.message);
        res.status(500).json({ error: "Failed to fetch products from database" });
    }
});

app.post('/products',async(req,res)=>{
    const {name,description,price,quantity} = req.body;
    if(!name || !price || price<=0){
        return res.status(400).send("please enter valid details");
    }
    const trx = await knex.transaction();
    try{
        const[product] = await trx('products').insert({name,description,price}).returning('*');
        await trx('inventory').insert({product_id:product.id,quantity:quantity||0});
        await trx.commit();
        return res.status(201).json({success:true});
    }catch(error){
        await trx.rollback();
        return res.status(500).json({error:error.message});
    }
});

app.put('/products/:id',async(req,res)=>{
    const id = req.params.id;
    if(isNaN(id)) {
        return res.status(400).json("enter valid id");
    }
    const {price,quantity} = req.body;
    const trx = await knex.transaction();
    try{
        if(price && price>=0){
            await trx('products').where('id','=',id).update({price});
        }
        if(quantity && quantity>=0){
            await trx('inventory').where('product_id', '=', id).update({quantity});
        }
        await trx.commit();
        return res.json({success:true});
    }catch(error){
        await trx.rollback();
        return res.status(500).json({error:error.message});
    }
});

// app.delete('/products/:id',async(req,res)=>{
//     const id = req.params.id;
//     if(isNaN(id)){
//         return res.status(400).json("please enter valid id");
//     }
//     const trx = await knex.transaction();
//     try{
//         // const deletedRow = await trx('products').where ({id}).del();
//         // await trx('inventory').where({id}).del();
//         // if(deletedRow===0){
//         //     return res.status(404).json({ error: "Product not found" });
//         // }  we dont need them both as deletion is CASCADE if something is pointing somewhere and we delete it point is also deleted
//         // Because of ON DELETE CASCADE, this one line removes both!
//         const deletedCount = await trx('products').where({ id }).del();

//         if (deletedCount === 0) {
//             return res.status(404).json({ error: "Product not found" });
//         }
//         trx.commit();
//         return res.json({success:true});
//     }catch(error){
//         trx.rollback();
//         return res.status(500).json({error:error.message});
//     }
// });
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
    }

    try {
        // No trx needed for a single command with CASCADE!
        const deletedCount = await knex('products').where({ id }).del();

        if (deletedCount === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        return res.json({ success: true, message: `Deleted product ${id}` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}/products`);
})