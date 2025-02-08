export default function PriceFetcher({ price, loadPrice }) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white text-pink-700 font-semibold text-2xl py-4 px-8 rounded-lg shadow-xl mb-3">
          <h2 className="text-xl font-semibold">FLR/USD Price:</h2>
          <p className="text-2xl text-blue-600">{price ? `$${price}` : "Loading..."}</p>
        </div>
  
        <button 
          onClick={loadPrice}
          className="bg-pink-600 text-white py-2 px-4 rounded-lg mt-3 hover:bg-pink-700 transition-colors mb-6">
          Refresh Price
        </button>
      </div>
    );
  }
  