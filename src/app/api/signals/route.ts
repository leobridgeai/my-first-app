import { NextResponse } from "next/server";
import { collectAllSignals } from "@/lib/signals";
import { computeDecision } from "@/lib/decision";
import { generateAlerts } from "@/lib/alerts";
import { DashboardData } from "@/types/signals";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Layer 1: Signal Engine - collect all signals
    const { price, signals } = await collectAllSignals();

    // Layer 2: Decision Layer - compute composite verdict
    const decision = computeDecision(signals);

    // Layer 3: Alerts Layer - generate alerts
    const alerts = generateAlerts(signals, decision, price);

    const data: DashboardData = {
      price,
      signals,
      decision,
      alerts,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    );
  }
}
