import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import GlassCard from '../components/common/GlassCard';
import { buttonPulse, hoverLift } from '../constants/animations';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-dark dark:via-black dark:to-gray-900 overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-teal/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-md w-full relative z-10"
            >
                <GlassCard className="text-center p-12 border-white/20 backdrop-blur-2xl shadow-2xl">
                    <motion.div
                        animate={{ 
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                        }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 text-red-500 mb-8"
                    >
                        <FiAlertTriangle className="text-5xl" />
                    </motion.div>

                    <h1 className="text-8xl font-black text-brand-dark dark:text-white mb-4 tracking-tighter font-futuristic">
                        404
                    </h1>
                    
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-widest">
                        Page Not Found
                    </h2>
                    
                    <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
                        The hyper-spatial coordinate you're looking for doesn't exist in this sector.
                    </p>

                    <Link to="/">
                        <motion.button
                            variants={buttonPulse}
                            whileHover="hover"
                            whileTap="whileTap"
                            className="bg-brand-dark dark:bg-white text-white dark:text-brand-dark px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 w-full shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            <FiArrowLeft className="text-xl" />
                            Return to Base
                        </motion.button>
                    </Link>
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default NotFound;
