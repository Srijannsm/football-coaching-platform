import { Card, CardContent } from "./Card";

function StatCard({ label, value }) {
    return (
        <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-6">
                <p className="text-sm font-medium text-neutral-400">{label}</p>
                <h2 className="mt-3 text-3xl font-extrabold text-white">{value}</h2>
            </CardContent>
        </Card>
    );
}

export default StatCard;