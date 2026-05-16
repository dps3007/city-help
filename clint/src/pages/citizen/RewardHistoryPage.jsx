import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import RewardHistory from "./RewardHistory";

export default function RewardHistoryPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Rewards"
        title="Reward history"
        description="Track how your community points were earned over time."
      />

      <Card className="overflow-hidden">
        <RewardHistory />
      </Card>
    </div>
  );
}
