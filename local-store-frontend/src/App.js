import {useState,useEffect} from 'react';
import  axios from 'axios';

function App(){
    const[ products, setProducts ] = useState([]);

  useEffect(()=>{
    fetchProducts();
  },[]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: ''
  });
  const fetchProducts = async()=>{
    try{
      const response = await axios.get('http://localhost:3000/products');
      setProducts(response.data);
    }catch(error){
      console.error("Error fetching products:", error);
    }
  };
  const handleDelete = async(id)=>{
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try{
      await axios.delete(`http://localhost:3000/products/${id}`);
      setProducts(products.filter(product=>product.id!==id));
      console.log(`Product ${id} deleted successfully`);
    }catch (error) {
        console.error("Delete failed:", error);
        alert("Could not delete product. Check your console!");
    }
  };
const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
        ...formData, 
        [name]: value 
    });
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
        alert("Please fill in a valid name and price!");
        return;
    }

    try {
        const productToSend = {
            ...formData,
            name: formData.name.trim()
        };

        const response = await axios.post(`http://localhost:3000/products`, productToSend);
        setProducts([...products, response.data]);
        setFormData({ name: '', price: '', quantity: '' });
        
    } catch (error) {
        console.error("Error adding product:", error);
    }
};

  return (
  <div style={{ padding: '20px' }}>
    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 py-4">
      Local Store Inventory
    </h1>
    <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h3>
      <div className="flex gap-4"> {/* flex and gap-4 put items in a row with spacing */}
        <input 
            name="name" 
            placeholder="Product Name" 
            value={formData.name} 
            onChange={handleInputChange} 
            className="border border-gray-300 rounded-md p-2 flex-1 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <input 
            name="price" 
            type="number" 
            placeholder="Price" 
            value={formData.price} 
            onChange={handleInputChange} 
            className="border border-gray-300 rounded-md p-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <input 
            name="quantity" 
            type="number" 
            placeholder="Quantity" 
            value={formData.quantity} 
            onChange={handleInputChange} 
            className="border border-gray-300 rounded-md p-2 w-24 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
            Add Product
        </button>
     </div>
    </form>
    <table className='min-w-full bg-white rounded-lg overflow-hidden'>
       <caption>Product Table</caption>
      <thead className='bg-gray-50 text-gray-600 uppercase text-sm spaceBetween'>
        <tr>
          <th className='text-left px-6 py-3'>ProductName</th>
          <th className='text-left px-6 py-3'>ProductPrice</th>
          <th className='text-left px-6 py-3'>ProductQuantity</th>
          <th className='text-left px-6 py-3'>ActionButton</th>
        </tr>
      </thead>
      <tbody>
        {
        products.length === 0 ? (
        <tr><td className="text-center py-10 text-gray-500" colSpan="4">No products found . Add one above!</td></tr>
         ) : (
        products.map((product)=>(
          <tr className="border-b border-gray-100 hover:bg-yellow-100 hover:shadow-lg transition-colors border 10px-red" key={product.id}>
            <td className='text-left px-6 py-3' >{product.name}</td>
            <td className='text-left px-6 py-3'> {`${Number(product.price).toFixed(2)}`} </td>
            <td className='text-left px-6 py-3'>{product.quantity}</td>
            <td className='text-left px-6 py-3'><button onClick={()=>handleDelete(product.id)} className='bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 rounded-md transition-all text-sm font-bold'>delete</button></td>
          </tr>
        ))
        )}
      </tbody>
    </table>
  </div>
);
}
export default App;