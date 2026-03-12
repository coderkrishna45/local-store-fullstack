const express = require('express');
const knexConfig = require('./knexfile.js');
const knex = require('knex')(knexConfig.development);

const app = express();
const PORT = 3000;

app.use(express.json());

const productRoutes = require('./routes/productRoutes');

app.use('/products',productRoutes);

app.use('/products',productRoutes);

app.use('/products/:id',productRoutes);
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