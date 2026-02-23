/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sun, 
  CloudRain, 
  Snowflake, 
  ThermometerSun, 
  Wind, 
  Cloud, 
  Briefcase, 
  Heart, 
  PartyPopper, 
  Mountain, 
  Shirt, 
  Sparkles, 
  Send, 
  User, 
  Bot,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Occasion, Weather, Recommendation, Message } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const OCCASIONS: { label: Occasion; icon: React.ReactNode }[] = [
  { label: 'Casual', icon: <Shirt className="w-5 h-5" /> },
  { label: 'Business', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Wedding', icon: <Sparkles className="w-5 h-5" /> },
  { label: 'Date Night', icon: <Heart className="w-5 h-5" /> },
  { label: 'Party', icon: <PartyPopper className="w-5 h-5" /> },
  { label: 'Outdoor Adventure', icon: <Mountain className="w-5 h-5" /> },
];

const WEATHERS: { label: Weather; icon: React.ReactNode }[] = [
  { label: 'Sunny', icon: <Sun className="w-5 h-5" /> },
  { label: 'Rainy', icon: <CloudRain className="w-5 h-5" /> },
  { label: 'Cold', icon: <Snowflake className="w-5 h-5" /> },
  { label: 'Hot', icon: <ThermometerSun className="w-5 h-5" /> },
  { label: 'Windy', icon: <Wind className="w-5 h-5" /> },
  { label: 'Snowy', icon: <Snowflake className="w-5 h-5" /> },
];

export default function App() {
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateRecommendation = async () => {
    if (!occasion || !weather) return;
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `As a professional fashion stylist, generate a detailed outfit recommendation for a ${occasion} occasion in ${weather} weather. Return the response in JSON format.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              outfit: { type: Type.STRING, description: "Detailed outfit recommendation" },
              footwear: { type: Type.STRING, description: "Footwear suggestion" },
              accessories: { type: Type.STRING, description: "Accessories recommendation" },
              stylingTips: { type: Type.STRING, description: "Practical and trendy styling tips" },
            },
            required: ["outfit", "footwear", "accessories", "stylingTips"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setRecommendation(result);
      
      // Reset chat when new recommendation is generated
      setMessages([
        { role: 'model', text: `Hello! I've generated a ${occasion} look for ${weather} weather. Do you have any specific questions about this outfit or need more styling advice?` }
      ]);
    } catch (error) {
      console.error("Error generating recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || chatLoading) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setChatLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: `You are a professional fashion stylist. You just recommended an outfit for a ${occasion} occasion in ${weather} weather. The recommendation was: ${JSON.stringify(recommendation)}. Answer the user's questions about fashion, styling, and this specific recommendation. Keep it trendy, practical, and encouraging.`,
        }
      });

      // Send history
      const response = await chat.sendMessage({
        message: inputValue
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl serif font-bold tracking-tight mb-4"
        >
          AuraStyle
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500 uppercase tracking-[0.2em] text-xs font-semibold"
        >
          Your Personal AI Fashion Stylist
        </motion.p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Selection Panel */}
        <section className="lg:col-span-4 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Select Occasion
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {OCCASIONS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setOccasion(item.label)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all border ${
                    occasion === item.label 
                      ? 'bg-black text-white border-black shadow-lg scale-105' 
                      : 'bg-zinc-50 text-zinc-600 border-transparent hover:border-zinc-200'
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] mt-2 font-medium text-center leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" /> Current Weather
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {WEATHERS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setWeather(item.label)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${
                    weather === item.label 
                      ? 'bg-black text-white border-black shadow-lg scale-105' 
                      : 'bg-zinc-50 text-zinc-600 border-transparent hover:border-zinc-200'
                  }`}
                >
                  {item.icon}
                  <span className="text-[10px] mt-2 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateRecommendation}
            disabled={!occasion || !weather || loading}
            className="w-full py-5 bg-black text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-zinc-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Curate My Look'}
          </button>
        </section>

        {/* Results Panel */}
        <section className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!recommendation && !loading ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-[40px] border-2 border-dashed border-zinc-200"
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <Shirt className="w-8 h-8 text-zinc-300" />
                </div>
                <h3 className="serif text-2xl mb-2">Ready to be styled?</h3>
                <p className="text-zinc-500 max-w-xs">Select your occasion and weather to receive a personalized fashion recommendation.</p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-zinc-50 rounded-[40px]"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-black" />
                </div>
                <h3 className="serif text-2xl mt-8 mb-2">Curating your perfect look...</h3>
                <p className="text-zinc-500">Our AI stylist is analyzing trends and conditions.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Outfit Card */}
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-zinc-100 rounded-2xl">
                        <Shirt className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold serif">The Outfit</h3>
                    </div>
                    <p className="text-zinc-700 leading-relaxed text-lg">{recommendation?.outfit}</p>
                  </div>

                  {/* Footwear Card */}
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-zinc-100 rounded-2xl">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold serif">Footwear</h3>
                    </div>
                    <p className="text-zinc-700 leading-relaxed">{recommendation?.footwear}</p>
                  </div>

                  {/* Accessories Card */}
                  <div className="bg-white p-8 rounded-[40px] border border-zinc-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-zinc-100 rounded-2xl">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold serif">Accessories</h3>
                    </div>
                    <p className="text-zinc-700 leading-relaxed">{recommendation?.accessories}</p>
                  </div>

                  {/* Styling Tips */}
                  <div className="bg-black text-white p-8 rounded-[40px] md:col-span-2 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/10 rounded-2xl">
                        <Info className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold serif">Styling Tips</h3>
                    </div>
                    <p className="text-zinc-300 leading-relaxed italic">"{recommendation?.stylingTips}"</p>
                  </div>
                </div>

                <button 
                  onClick={() => setChatOpen(true)}
                  className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Bot className="w-5 h-5" /> Ask Stylist for Advice
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Chat Drawer */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Styling Assistant</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Online</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-3xl ${
                      msg.role === 'user' 
                        ? 'bg-black text-white rounded-tr-none' 
                        : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-6 border-t border-zinc-100">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about colors, fit, or alternatives..."
                    className="w-full py-4 pl-6 pr-14 bg-zinc-50 border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || chatLoading}
                    className="absolute right-2 p-3 bg-black text-white rounded-full hover:bg-zinc-800 transition-all disabled:opacity-20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 pb-8 text-center text-zinc-400 text-[10px] uppercase tracking-[0.3em]">
        &copy; 2026 AuraStyle &bull; Powered by Gemini 3.1 Pro
      </footer>
    </div>
  );
}
