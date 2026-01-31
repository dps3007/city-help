import RewardHistory from "./RewardHistory";

export default function RewardHistoryPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Reward History
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Track how you earned your community points over time
        </p>
      </div>

      {/* History Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <RewardHistory />
      </div>

    </div>
  );
}
