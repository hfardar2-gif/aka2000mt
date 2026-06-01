import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LogOut } from "lucide-react";
import report from "@/data/report.json";
import { StatCard } from "@/components/dashboard/StatCard";
import { Section } from "@/components/dashboard/Section";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Daily 2000mt Project Report — Production Dashboard" },
      { name: "description", content: "Live management dashboard for the Daily 2000mt galvanizing project: production, yields, sales, planning." },
      { property: "og:title", content: "Daily 2000mt Project Report" },
      { property: "og:description", content: "Production, yield, warehouse and sales overview for the 2000mt project." },
    ],
  }),
  component: Index,
});

const fmt = (n: number, d = 2) =>
  n?.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) ?? "—";
const fmt0 = (n: number) => n?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—";
const fmtRial = (n: number) => {
  if (!n) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " M";
  return n.toLocaleString("en-US");
};

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Index() {
  const t = report.totals;
  const dailyNumeric = report.daily.map((d) => ({
    date: d.date.slice(5),
    pickling: typeof d.pickling === "number" ? d.pickling : 0,
    rolling: typeof d.rolling === "number" ? d.rolling : 0,
    galv: typeof d.galv === "number" ? d.galv : 0,
    shutdown: d.pickling === "Shut down",
  }));

  const cumulativeNumeric = report.cumulative.map((d) => ({
    date: d.date.slice(5),
    pickling: typeof d.pickling === "number" ? d.pickling : null,
    rolling: typeof d.rolling === "number" ? d.rolling : null,
    galv: typeof d.galv === "number" ? d.galv : null,
  }));

  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="border-b border-border"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Management Report
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Daily 2000mt Project Report
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Cumulative production, yield, warehouse balance, sales & planning for the
                galvanizing line.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Report date</p>
                <p className="font-semibold tabular-nums">{report.reportDate}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Version</p>
                <p className="font-semibold tabular-nums">v{report.version}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Input Coils" value={fmt(t.inputCoilsTon, 0)} unit="ton" hint={`${t.inputCoilsQty} coils`} />
          <StatCard label="Pickling" value={fmt(t.pickling, 0)} unit="ton" accent="chart-2" />
          <StatCard label="Rolling" value={fmt(t.rolling, 0)} unit="ton" accent="chart-4" />
          <StatCard label="Galvanized" value={fmt(t.galvanized, 0)} unit="ton" accent="primary" />
          <StatCard label="Sold" value={fmt(t.sold, 0)} unit="ton" accent="accent" />
          <StatCard label="Ready to ship" value={fmt(report.transport.readyWarehouse, 0)} unit="ton" accent="chart-2" />
        </div>

        {/* Yields */}
        <Section title="Process Yields" subtitle="Efficiency across each stage of the line">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {report.yields.map((y) => {
              const pct = y.value * 100;
              return (
                <div key={y.process} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="text-sm font-medium text-foreground">{y.process}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{y.formula}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums text-primary">
                      {pct.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Daily chart + Cumulative chart */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Daily Production" subtitle="Ton per day by process">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyNumeric}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="pickling" stackId="a" fill="var(--color-chart-2)" name="Pickling" />
                  <Bar dataKey="rolling" stackId="a" fill="var(--color-chart-4)" name="Rolling" />
                  <Bar dataKey="galv" stackId="a" fill="var(--color-chart-1)" name="Galvanized" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Cumulative Production" subtitle="Running totals across the project">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeNumeric}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="pickling" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} name="Pickling" connectNulls />
                  <Line type="monotone" dataKey="rolling" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} name="Rolling" connectNulls />
                  <Line type="monotone" dataKey="galv" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} name="Galvanized" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Warehouse / Material Balance / Scrap */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title="Warehouse & WIP" subtitle="Stocks held in process">
            <ul className="space-y-3">
              {report.warehouse.map((w) => (
                <li key={w.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-foreground">{w.name}</span>
                  <span className="font-semibold tabular-nums text-primary">{fmt(w.ton)} <span className="text-xs text-muted-foreground">ton</span></span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Material Balance" subtitle="Factory input vs output + WIP + scrap">
            <ul className="space-y-2">
              {report.materialBalance.map((m) => (
                <li key={m.k} className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{m.k}</span>
                  <span className="font-semibold tabular-nums text-foreground">{fmt(m.v)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Scrap by Line" subtitle="Spira & scrap totals">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={report.scrap} dataKey="ton" nameKey="line" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {report.scrap.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Coating consumption */}
        <Section title="Coating Weight Consumed (Zinc & Zamak)" subtitle="Theoretical vs actual coating with 20% dross loss">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Thickness (mm)</th>
                  <th className="py-3 pr-4 font-medium">Width</th>
                  <th className="py-3 pr-4 text-right font-medium">Produced (ton)</th>
                  <th className="py-3 pr-4 text-right font-medium">Theoretical Zn (kg)</th>
                  <th className="py-3 pr-4 text-right font-medium">Dross 20% (kg)</th>
                  <th className="py-3 text-right font-medium">Actual coating (kg)</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {report.coating.map((c) => (
                  <tr key={c.thickness} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="py-3 pr-4 font-medium text-foreground">{c.thickness}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.width}</td>
                    <td className="py-3 pr-4 text-right">{fmt(c.weight)}</td>
                    <td className="py-3 pr-4 text-right">{fmt(c.theoZn)}</td>
                    <td className="py-3 pr-4 text-right text-accent">{fmt(c.dross)}</td>
                    <td className="py-3 text-right font-semibold text-primary">{fmt(c.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Zinc & Zamak purchased</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{fmt(report.zincPurchased)} <span className="text-xs text-muted-foreground">ton</span></p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-primary">Remaining</p>
              <p className="mt-1 text-xl font-semibold text-primary">{fmt(report.zincRemaining)} <span className="text-xs text-muted-foreground">ton</span></p>
            </div>
          </div>
        </Section>

        {/* Sales + Transport */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Section title="Sales Report" subtitle="Buyer transactions">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Buyer</th>
                    <th className="py-3 pr-4 text-right font-medium">Tonnage</th>
                    <th className="py-3 text-right font-medium">Amount (rial)</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {report.sales.map((s, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="py-3 pr-4 text-muted-foreground">{s.date}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">{s.buyer}</td>
                      <td className="py-3 pr-4 text-right">{fmt(s.tonnage)}</td>
                      <td className="py-3 text-right font-semibold text-primary">{fmtRial(s.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>
          <Section title="Transport" subtitle="Loading status">
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Under loading</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{fmt(report.transport.underLoading)} <span className="text-xs text-muted-foreground">ton</span></p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <p className="text-xs uppercase tracking-wider text-primary">Ready in warehouse</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{fmt(report.transport.readyWarehouse)} <span className="text-xs text-muted-foreground">ton</span></p>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Under-loading capacity must be at least 25 ton to enable delivery to the buyer.
              </p>
            </div>
          </Section>
        </div>

        {/* Plan */}
        <Section title="Production Plan" subtitle="Weekly plan and execution status">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Thickness (mm)</th>
                  <th className="py-3 pr-4 font-medium">Width</th>
                  <th className="py-3 pr-4 text-right font-medium">Tons</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {report.plan.map((p, i) => (
                  <tr key={i} className="border-b border-border/60 hover:bg-secondary/30">
                    <td className="py-3 pr-4 font-medium text-foreground">{p.date}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.thickness}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{p.width}</td>
                    <td className="py-3 pr-4 text-right font-semibold">{p.tons}</td>
                    <td className="py-3">
                      {p.status ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {p.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-2.5 py-0.5 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                          Scheduled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Notes */}
        <Section title="Notes" subtitle="Decisions & remarks">
          <ol className="space-y-3 text-sm">
            {report.notes.map((n, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold tabular-nums text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{n}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Signature */}
        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-sm">
          <p className="text-muted-foreground">
            Generated from <span className="font-medium text-foreground">Report.xlsx</span> · Daily 2000mt project
          </p>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{report.signature.role}</p>
            <p className="mt-0.5 font-semibold text-foreground">{report.signature.name}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
