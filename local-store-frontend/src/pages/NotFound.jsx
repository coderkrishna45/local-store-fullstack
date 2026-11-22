import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-black text-gray-900">Page not found</h1>
      <p className="text-gray-500 mt-2">That link does not go anywhere in the store.</p>
      <Link to="/" className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700">
        Back to shop
      </Link>
    </div>
  );
};

export default NotFound;
