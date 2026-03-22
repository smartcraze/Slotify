import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  iconClassName?: string;
};

export function StatCard(props: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="mb-1 flex items-start justify-between gap-3">
          <CardDescription>{props.label}</CardDescription>
          {props.icon ? (
            <div className={`inline-flex size-8 items-center justify-center rounded-full ${props.iconClassName ?? "bg-primary/10 text-primary"}`}>
              {props.icon}
            </div>
          ) : null}
        </div>
        <CardTitle>{props.value}</CardTitle>
      </CardHeader>
      {props.hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{props.hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
