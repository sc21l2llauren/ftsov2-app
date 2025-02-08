export default function PriceFetcher({ price, loadPrice, selectedCrypto, setSelectedCrypto }) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white text-pink-700 font-semibold text-2xl py-4 px-8 rounded-lg shadow-xl mb-3">
          <h2 className="text-xl font-semibold">{selectedCrypto} / USD Price:</h2>
          <p className="text-2xl text-blue-600">{price ? `$${price}` : "Loading..."}</p>
        </div>
  
        {/* Dropdown for selecting cryptocurrency */}
        <select 
          value={selectedCrypto} 
          onChange={(e) => setSelectedCrypto(e.target.value)}
          className="bg-white text-gray-800 py-2 px-4 rounded-lg shadow-md mb-3 border border-gray-300"
        >
          <option value="FLR">FLR/USD</option>
          <option value="BTC">BTC/USD</option>
          <option value="ETH">ETH/USD</option>
        </select>
  
        <button 
          onClick={loadPrice}
          className="bg-pink-600 text-white py-2 px-4 rounded-lg mt-3 hover:bg-pink-700 transition-colors mb-6">
          Refresh Price
        </button>
      </div>
    );
  }
  