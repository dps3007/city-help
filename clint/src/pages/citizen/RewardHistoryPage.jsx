import RewardHistory from "./RewardHistory";

export default function RewardHistoryPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Reward History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track how you earned your community points
        </p>
      </div>

      <RewardHistory />
    </div>
  );
}
