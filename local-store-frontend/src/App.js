import react, {useState,useEffect} from 'react';
import  axios from 'axios';

function App(){
    const[ products, setProducts ] = useState([]);

  useEffect(()=>{
    fetchProducts();
  },[]);

  const fetchProducts = async()=>{
    try{
      const response = await axios.get('http://localhost:3000/products');
      setProducts(response.data);
    }catch(error){
      console.error("Error fetching products:", error);
    }
  };
  return (
      <div style={{ padding: '20px' }}>
        <h1>Local Store Inventory</h1>
        
        {/* 4. We map through the products array and turn each one into HTML */}
        <ul>
          {products.map(product => (
            <li key={product.id}>
              {product.name} - ${product.price} (Stock: {product.quantity})
            </li>
          ))}
        </ul>
      </div>
    );
}
export default App;