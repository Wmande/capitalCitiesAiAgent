"use client";
import { useState } from "react";

export default function Home() {
  const [country, setCountry] = useState("");
  const [capital, setCapital] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCapital = async () => {
    if (!country.trim()) {
      setError("Please enter a country name");
      return;
    }

    setLoading(true);
    setError("");
    setCapital("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${apiUrl}/capital/${encodeURIComponent(country)}`;
      
      // console.log('Fetching from:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to fetch');
      }
      
      const data = await res.json();
      setCapital(data.capital);
      
    } catch (error) {
      setError(error.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchCapital();
    }
  };

  // Predefined example questions for users to try
  const exampleCountries = [
    { name: "Kenya", flag: "🇰🇪", capital: "Nairobi" },
    { name: "USA", flag: "🇺🇸", capital: "Washington D.C." },
    { name: "France", flag: "🇫🇷", capital: "Paris" },
    { name: "Japan", flag: "🇯🇵", capital: "Tokyo" },
    { name: "Brazil", flag: "🇧🇷", capital: "Brasília" },
    { name: "Germany", flag: "🇩🇪", capital: "Berlin" },
    { name: "India", flag: "🇮🇳", capital: "New Delhi" },
    { name: "Australia", flag: "🇦🇺", capital: "Canberra" }
  ];
  
  const invalidExamples = [
    { text: "What is 2+2?", icon: "🧮" },
    { text: "Tell me a joke", icon: "😂" },
    { text: "How are you?", icon: "👋" },
    { text: "Weather today", icon: "🌤️" }
  ];

  const tryExample = (example) => {
    setCountry(example);
    setError("");
    setCapital("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
      </div>

      <main className="relative flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Capital Cities
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your AI-powered geography assistant. Discover capital cities from around the world instantly.
          </p>
        </div>
      
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-xl">💡</span>
              <div>
                <p className="text-blue-800 font-semibold text-sm">Specialized Assistant</p>
                <p className="text-blue-700 text-xs">I only answer questions about world capital cities</p>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Enter a country name (e.g., Kenya, USA, France)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50/50 placeholder-gray-500 text-gray-800 transition-all duration-200"
              disabled={loading}
            />
          </div>
        
          {/* Search Button */}
          <button
            onClick={fetchCapital}
            disabled={loading || !country.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Find Capital City</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-xl animate-pulse">
              <div className="flex items-center gap-2">
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Result */}
          {capital && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl animate-fadeIn">
              <div className="text-center">
                <p className="text-green-800 text-lg">
                  The capital of <span className="font-bold text-green-900">{country}</span> is
                </p>
                <p className="text-2xl font-bold text-green-900 mt-2">{capital}</p>
              </div>
            </div>
          )}
        </div>

        {/* Valid Examples */}
        <div className="mt-8 w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Popular Countries to Try
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {exampleCountries.map((example) => (
              <button
                key={example.name}
                onClick={() => tryExample(example.name)}
                className="p-4 bg-white/60 backdrop-blur-sm border border-green-200 text-green-800 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                <div className="font-semibold text-sm">{example.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Invalid Examples */}
        <div className="mt-6 w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            These Questions Will Be Rejected
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {invalidExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => tryExample(example.text)}
                className="p-4 bg-white/60 backdrop-blur-sm border border-red-200 text-red-800 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                <div className="font-medium text-xs">"{example.text}"</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center max-w-2xl">
          <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="font-semibold text-gray-700">AI Geography Assistant</span>
            </div>
            <p className="text-xs text-gray-600">
              This assistant is specialized in world geography and will only respond to questions about capital cities of countries. 
              Powered by Azure OpenAI for accurate and up-to-date information.
            </p>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}