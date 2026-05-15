import { useState } from "react";
import { motion } from "framer-motion";

function Tabs({ tabs, defaultTab = 0, onTabChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex border-b border-border gap-2 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabChange(index)}
            className={`relative px-4 py-3 font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === index
                ? "text-primary-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full"
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-6"
      >
        {tabs[activeTab]?.content}
      </motion.div>
    </div>
  );
}

export default Tabs;
