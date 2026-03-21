import { Card, CardBody, Skeleton } from "@/components/ui";

export function MessagesLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="w-5 h-5">
                <Skeleton variant="rectangular" className="w-5 h-5 rounded" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="w-1/3 h-5" />
                <Skeleton className="w-1/4 h-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
