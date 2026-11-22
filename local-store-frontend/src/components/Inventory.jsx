import { useState } from 'react';
import api from '../api';

const emptyProduct = { name: '', description: '', price: '', stock: '', category: '', weight: '', image: '' };
const inputClass = 'w-full rounded border border-gray-300 p-2';

export default function Inventory({ products, categories, onProductsChange }) {
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingId(null);
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setError('');
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || '',
      weight: product.weight || '',
      image: product.image || '',
    });
  };

  const changeField = ({ target }) => {
    setForm(current => ({ ...current, [target.name]: target.value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = editingId
        ? await api.put(`/api/products/${editingId}`, form)
        : await api.post('/api/products', form);
      const saved = { ...data, category: categories.find(category => category._id === data.category) };
      onProductsChange(current => editingId
        ? current.map(product => product._id === editingId ? saved : product)
        : [...current, saved]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the product.');
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setBusy(true);
    setError('');
    try {
      await api.delete(`/api/products/${product._id}`);
      onProductsChange(current => current.filter(item => item._id !== product._id));
      if (editingId === product._id) resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the product.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Inventory</h3>
      {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
      {categories.length === 0 && <p className="mb-4">Add categories before saving products.</p>}
      <form onSubmit={saveProduct}>
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-3 font-semibold">{editingId ? 'Edit product' : 'Add product'}</legend>
          <label>Name<input className={inputClass} name="name" value={form.name} onChange={changeField} required minLength={2} /></label>
          <label>Description<input className={inputClass} name="description" value={form.description} onChange={changeField} required /></label>
          <label>Price<input className={inputClass} name="price" type="number" min="0" step="0.01" value={form.price} onChange={changeField} required /></label>
          <label>Stock<input className={inputClass} name="stock" type="number" min="0" step="1" value={form.stock} onChange={changeField} required /></label>
          <label>Category
            <select className={inputClass} name="category" value={form.category} onChange={changeField} required>
              <option value="">Select a category</option>
              {categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </label>
          <label>Weight or size<input className={inputClass} name="weight" value={form.weight} onChange={changeField} /></label>
          <label>Image URL<input className={inputClass} name="image" value={form.image} onChange={changeField} /></label>
          <div className="flex items-end gap-3">
            <button className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50" disabled={!categories.length}>
              {editingId ? 'Save changes' : 'Add product'}
            </button>
            {editingId && <button type="button" className="p-2" onClick={resetForm}>Cancel</button>}
          </div>
        </fieldset>
      </form>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Stock</th><th scope="col">Actions</th></tr></thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t">
                <td className="py-2">{product.name}</td>
                <td>{product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button type="button" disabled={busy} onClick={() => editProduct(product)} className="mr-3 text-blue-700">Edit</button>
                  <button type="button" disabled={busy} onClick={() => deleteProduct(product)} className="text-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="4" className="py-4">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
