import { Card, CardContent } from "./Card";

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-app-text-muted">{label}</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-app-text">
          {value}
        </h2>
      </CardContent>
    </Card>
  );
}

import { memo } from "react";
export default memo(StatCard);