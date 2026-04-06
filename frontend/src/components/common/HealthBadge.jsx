import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const HealthBadge = () => {
    const [status, setStatus] = useState('loading'); // loading, online, offline
    const [latency, setLatency] = useState(null);

    useEffect(() => {
        const checkHealth = async () => {
            const start = Date.now();
            try {
                // Using the proxy or direct URL depends on environment, but axiosInstance is better usually.
                // However, for a simple health check, we'll use a clean axios call to the path.
                const response = await axios.get('/api/health/', { timeout: 3000 });
                if (response.status === 200) {
                    setStatus('online');
                    setLatency(Date.now() - start);
                } else {
                    setStatus('offline');
                }
            } catch (err) {
                setStatus('offline');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bottom-20 right-6 z-50 pointer-events-none"
            >
                <div className={`px-4 py-2 rounded-full backdrop-blur-md border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-2xl transition-colors duration-500
                    ${status === 'online' ? 'bg-neon-teal/10 border-neon-teal/30 text-neon-teal' : 
                      status === 'offline' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 
                      'bg-white/10 border-white/20 text-gray-400'}`}
                >
                    {status === 'loading' && <FiLoader className="animate-spin text-sm" />}
                    {status === 'online' && <FiCheckCircle className="text-sm" />}
                    {status === 'offline' && <FiXCircle className="text-sm" />}
                    
                    <span>{status === 'online' ? `Backend Online (${latency}ms)` : status === 'offline' ? 'Connection Lost' : 'Syncing...'}</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HealthBadge;
