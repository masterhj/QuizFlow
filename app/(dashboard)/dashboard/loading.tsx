import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <Skeleton variant="text" />
      </div>

      {/* 4 Metric Cards - 2x2 grid on tablet, 1 column on mobile */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="elevated" padding="lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" lines={1} />
                <Skeleton variant="circle" />
              </div>
              <Skeleton variant="text" lines={1} />
              <Skeleton variant="text" size="sm" />
            </div>
          </Card>
        ))}
      </div>

      {/* Large Chart Card */}
      <Card variant="elevated" padding="lg">
        <div className="space-y-4">
          <Skeleton variant="text" lines={1} />
          <Skeleton variant="card" />
        </div>
      </Card>

      {/* Two Column Grid: List + Small Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* List Column (2/3 on desktop) */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="lg">
            <div className="space-y-4">
              <Skeleton variant="text" lines={1} />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" lines={1} />
                  <Skeleton variant="text" size="sm" lines={1} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Small Chart Column (1/3 on desktop) */}
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            <Skeleton variant="text" lines={1} />
            <Skeleton variant="card" />
          </div>
        </Card>
      </div>
    </div>
  );
}
