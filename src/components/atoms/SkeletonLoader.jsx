import { motion } from 'framer-motion';

const SkeletonLoader = ({ 
  count = 1, 
  height = 'h-4', 
  width = 'w-full',
  className = '' 
}) => {
  const shimmerVariants = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`
        ${height} ${width} bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 
        bg-[length:200%_100%] rounded-md ${className}
      `}
      variants={shimmerVariants}
      animate="animate"
      style={{
        backgroundImage: 'linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%'
      }}
    />
  ));

  return count === 1 ? skeletonItems[0] : (
    <div className="space-y-3">
      {skeletonItems}
    </div>
  );
};

export default SkeletonLoader;