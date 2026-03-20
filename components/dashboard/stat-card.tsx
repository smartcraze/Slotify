import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard(props: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{props.label}</CardDescription>
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
