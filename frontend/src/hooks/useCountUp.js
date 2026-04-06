import { useState, useEffect } from 'react';

/**
 * Custom hook to animate a number from zero to a target value.
 * @param {number} end - The target value.
 * @param {number} duration - The duration of the animation in ms.
 * @returns {number} The current animated value.
 */
const useCountUp = (end, duration = 800) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrameId;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [end, duration]);

    return count;
};

export default useCountUp;
