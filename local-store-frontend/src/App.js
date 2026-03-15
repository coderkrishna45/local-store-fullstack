import react, {useState,useEffect} from 'react';
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
    <h1>Local Store Inventory</h1>
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc' }}>
    <h3>Add New Product</h3>
    <input 
        name="name" 
        placeholder="Product Name" 
        value={formData.name} 
        onChange={handleInputChange} 
    />
    <input 
        name="price" 
        type="number" 
        placeholder="Price" 
        value={formData.price} 
        onChange={handleInputChange} 
    />
    <input 
        name="quantity" 
        type="number" 
        placeholder="Quantity" 
        value={formData.quantity} 
        onChange={handleInputChange} 
    />
    <button type="submit">Add Product</button>
</form>
    <ul>
      {products.map(product => (
        <li key={product.id} style={{ marginBottom: '10px', listStyle: 'none' }}>
          <strong>{product.name}</strong> - ${product.price} (Stock: {product.quantity})
          
          {/* THE DELETE BUTTON */}
          <button 
            onClick={() => handleDelete(product.id)}
            style={{ 
              marginLeft: '15px', 
              color: 'white', 
              backgroundColor: 'red', 
              border: 'none', 
              padding: '5px 10px', 
              cursor: 'pointer',
              borderRadius: '4px' 
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </div>
);
}
export default App;