import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  FlaskConical, 
  MapPin, 
  ChevronRight, 
  Loader2,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  X,
  User
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from './lib/utils';
import { SoilData, CropRecommendation } from './types';

const InputField = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit,
  description,
  error
}: { 
  label: string; 
  icon: any; 
  value: number; 
  onChange: (val: number) => void; 
  min: number; 
  max: number; 
  step?: number;
  unit?: string;
  description?: string;
  error?: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
        <Icon className="w-4 h-4 text-emerald-600" />
        {label}
      </label>
      <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600",
        error && "accent-red-500"
      )}
    />
    {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    {description && !error && <p className="text-[10px] text-zinc-400 italic">{description}</p>}
  </div>
);

const TextInputField = ({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  placeholder,
  error
}: { 
  label: string; 
  icon: any; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
      <Icon className="w-4 h-4 text-emerald-600" />
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-2 rounded-xl border bg-white text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none",
        error ? "border-red-300 focus:border-red-500" : "border-zinc-200 focus:border-emerald-500"
      )}
    />
    {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
        }),
      });
      
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Farming Assistant</h3>
                  <p className="text-[10px] opacity-70">Online • AI Powered</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sprout className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm text-zinc-500 px-4">
                    Hello! I'm your agricultural expert. Ask me anything about crops, soil, or farming!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-emerald-600 text-white rounded-tr-none" 
                      : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-xl shadow-emerald-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<CropRecommendation | null>(null);
  const [formData, setFormData] = useState<SoilData>({
    n: 90,
    p: 42,
    k: 43,
    temperature: 20,
    humidity: 82,
    ph: 6.5,
    rainfall: 202,
    location: '',
  });

  const validate = () => {
    const errors: Record<string, string> = {};
    if (formData.n < 0 || formData.n > 140) errors.n = "Nitrogen must be between 0 and 140";
    if (formData.p < 5 || formData.p > 145) errors.p = "Phosphorus must be between 5 and 145";
    if (formData.k < 5 || formData.k > 205) errors.k = "Potassium must be between 5 and 205";
    if (formData.temperature < 8 || formData.temperature > 45) errors.temperature = "Temperature must be between 8 and 45°C";
    if (formData.humidity < 14 || formData.humidity > 100) errors.humidity = "Humidity must be between 14 and 100%";
    if (formData.ph < 3.5 || formData.ph > 10) errors.ph = "pH must be between 3.5 and 10";
    if (formData.rainfall < 20 || formData.rainfall > 300) errors.rainfall = "Rainfall must be between 20 and 300mm";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to fetch recommendation');
      const data = await response.json();
      setRecommendation(data);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importanceData = recommendation ? Object.entries(recommendation.featureImportance).map(([name, value]) => ({
    name,
    value
  })) : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Sprout className="text-white w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Smart Farming Assistant</h1>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-emerald-600 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">History</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Resources</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">Soil & Environment</h2>
                <p className="text-sm text-zinc-500">Adjust the parameters to get a recommendation.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nutrients (NPK)</h3>
                  <InputField 
                    label="Nitrogen (N)" 
                    icon={TrendingUp} 
                    value={formData.n} 
                    onChange={(v) => setFormData({...formData, n: v})} 
                    min={0} max={140} 
                    description="Essential for leaf growth"
                    error={validationErrors.n}
                  />
                  <InputField 
                    label="Phosphorus (P)" 
                    icon={TrendingUp} 
                    value={formData.p} 
                    onChange={(v) => setFormData({...formData, p: v})} 
                    min={5} max={145} 
                    description="Critical for root development"
                    error={validationErrors.p}
                  />
                  <InputField 
                    label="Potassium (K)" 
                    icon={TrendingUp} 
                    value={formData.k} 
                    onChange={(v) => setFormData({...formData, k: v})} 
                    min={5} max={205} 
                    description="Improves overall plant health"
                    error={validationErrors.k}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Environment</h3>
                  <InputField 
                    label="Temperature" 
                    icon={Thermometer} 
                    value={formData.temperature} 
                    onChange={(v) => setFormData({...formData, temperature: v})} 
                    min={8} max={45} 
                    unit="°C"
                    error={validationErrors.temperature}
                  />
                  <InputField 
                    label="Humidity" 
                    icon={Droplets} 
                    value={formData.humidity} 
                    onChange={(v) => setFormData({...formData, humidity: v})} 
                    min={14} max={100} 
                    unit="%"
                    error={validationErrors.humidity}
                  />
                  <InputField 
                    label="Soil pH" 
                    icon={FlaskConical} 
                    value={formData.ph} 
                    onChange={(v) => setFormData({...formData, ph: v})} 
                    min={3.5} max={10} 
                    step={0.1}
                    error={validationErrors.ph}
                  />
                  <InputField 
                    label="Rainfall" 
                    icon={CloudRain} 
                    value={formData.rainfall} 
                    onChange={(v) => setFormData({...formData, rainfall: v})} 
                    min={20} max={300} 
                    unit="mm"
                    error={validationErrors.rainfall}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Location (Optional)</h3>
                  <TextInputField 
                    label="Location" 
                    icon={MapPin} 
                    value={formData.location || ''} 
                    onChange={(v) => setFormData({...formData, location: v})} 
                    placeholder="e.g. Punjab, India"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                    loading 
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-[0.98]"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Data...
                    </>
                  ) : (
                    <>
                      Get Recommendation
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!recommendation && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-zinc-50 border border-dashed border-zinc-200 rounded-3xl"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                    <Sprout className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Grow?</h3>
                  <p className="text-zinc-500 max-w-md">
                    Enter your soil data on the left to receive a personalized AI-powered crop recommendation.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4"
                >
                  <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900">Analysis Failed</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {recommendation && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Primary Recommendation Card */}
                  <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sprout className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-emerald-100 text-sm font-medium mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Optimal Match Found
                        </div>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">
                          {recommendation.recommendedCrop}
                        </h2>
                        <div className="flex items-center gap-4">
                          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl">
                            <span className="text-xs uppercase font-bold tracking-wider block opacity-70">Confidence</span>
                            <span className="text-2xl font-mono font-bold">{recommendation.confidence}%</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-emerald-50 leading-relaxed text-sm">
                              {recommendation.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Alternatives */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Top Alternatives
                        </h3>
                        <div className="space-y-3">
                          {recommendation.alternatives.map((alt, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                              <span className="font-medium">{alt.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${alt.suitability}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono font-bold text-zinc-500">{alt.suitability}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Farming Tips */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Expert Tips
                        </h3>
                        <ul className="space-y-3">
                          {recommendation.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                              <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold text-emerald-600">{i + 1}</span>
                              </div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance Chart */}
                  <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold">Decision Factors</h3>
                      <p className="text-sm text-zinc-500">How each parameter influenced the recommendation.</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={importanceData} layout="vertical" margin={{ left: 20, right: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500 }}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                            {importanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <ChatBot />
      {/* Footer */}
      <footer className="border-t border-zinc-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Sprout className="w-5 h-5" />
            <span className="font-bold tracking-tight">Smart Farming Assistant</span>
          </div>
          <p className="text-zinc-400 text-sm">
            Empowering farmers with AI-driven agricultural insights.
          </p>
        </div>
      </footer>
    </div>
  );
}
