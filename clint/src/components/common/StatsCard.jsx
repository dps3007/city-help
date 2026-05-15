import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  variant = "primary",
  trend = "up",
}) {
  const variants = {
    primary: "from-primary-600 to-primary-700",
    accent: "from-accent-500 to-accent-600",
    success: "from-green-500 to-emerald-600",
    warning: "from-amber-500 to-orange-600",
    danger: "from-red-500 to-rose-600",
  };

  const isPositive = trend === "up";

  return (
    <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${variants[variant]} p-6 text-white shadow-lg`}>
      {/* Background Decoration */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-white opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>

          {change !== undefined && (
            <div className="flex items-center gap-1 mt-3">
              {isPositive ? (
                <ArrowUpRight size={16} className="text-green-300" />
              ) : (
                <ArrowDownRight size={16} className="text-red-300" />
              )}
              <span className={`text-sm font-semibold ${isPositive ? "text-green-300" : "text-red-300"}`}>
                {Math.abs(change)}% {isPositive ? "increase" : "decrease"}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="h-12 w-12 rounded-lg bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
