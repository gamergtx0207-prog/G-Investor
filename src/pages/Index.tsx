import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button"; // Import Button
import { Link } from "react-router-dom"; // Import Link

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
        <h1 className="text-5xl font-extrabold mb-6 text-indigo-800">
          Welcome to Your Financial Hub
        </h1>
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Start building your amazing financial tools here! Explore our portfolio calculator to get started.
        </p>
        <Link to="/portfolio-calculator">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Launch Portfolio Calculator
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;