import PriceFetcher from "./components/PriceFetcher";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
      <h1 className="text-4xl font-extrabold text-white mb-8 sm:text-5xl md:text-6xl lg:text-7xl">
        Flare Network Price Tracker
      </h1>
      <PriceFetcher />
      
    </div>
  );
}
