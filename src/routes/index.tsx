import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sun, Moon, Printer, Languages } from "lucide-react";
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
import report from "@/data/report.json";
import { StatCard } from "@/components/dashboard/StatCard";
import { Section } from "@/components/dashboard/Section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "2000mt Project Report — Production Dashboard" },
      { name: "description", content: "Live management dashboard for the Daily 2000mt galvanizing project: production, yields, sales, planning." },
      { property: "og:title", content: "2000mt Project Report" },
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

type Lang = "en" | "zh" | "fa";
const translations: Record<string, Record<Lang, string>> = {
  badge: { en: "Management Report", zh: "管理报告", fa: "گزارش مدیریتی" },
  title: { en: "2000mt Project Report", zh: "2000 吨项目报告", fa: "گزارش پروژه ۲۰۰۰ تن" },
  subtitle: {
    en: "Cumulative production, yield, warehouse balance, sales & planning for the galvanizing line.",
    zh: "镀锌生产线的累计产量、良率、库存、销售与计划。",
    fa: "تولید تجمعی، راندمان، موجودی انبار، فروش و برنامه‌ریزی خط گالوانیزه.",
  },
  reportDate: { en: "Report date", zh: "报告日期", fa: "تاریخ گزارش" },
  version: { en: "Version", zh: "版本", fa: "نسخه" },
  statusOk: { en: "Status: Success", zh: "状态:成功", fa: "وضعیت: موفق" },
  statusFail: { en: "Status: Failed", zh: "状态:失败", fa: "وضعیت: ناموفق" },
  lastUpdated: { en: "Last updated:", zh: "最后更新:", fa: "آخرین به‌روزرسانی:" },
  inputCoils: { en: "Input Coils", zh: "输入卷材", fa: "کلاف‌های ورودی" },
  pickling: { en: "Pickling", zh: "酸洗", fa: "اسیدشویی" },
  rolling: { en: "Rolling", zh: "轧制", fa: "نورد" },
  galvanized: { en: "Galvanized", zh: "镀锌", fa: "گالوانیزه" },
  sold: { en: "Sold", zh: "已售", fa: "فروش رفته" },
  readyToShip: { en: "Ready to ship", zh: "待发货", fa: "آماده ارسال" },
  ton: { en: "ton", zh: "吨", fa: "تن" },
  coils: { en: "coils", zh: "卷", fa: "کلاف" },
  yields: { en: "Process Yields", zh: "工序良率", fa: "راندمان فرآیند" },
  yieldsSub: { en: "Efficiency across each stage of the line", zh: "各工序效率", fa: "بازده در هر مرحله از خط" },
  dailyProd: { en: "Daily Production", zh: "每日产量", fa: "تولید روزانه" },
  dailyProdSub: { en: "Ton per day by process", zh: "按工序每日吨数", fa: "تن در روز به تفکیک فرآیند" },
  cumProd: { en: "Cumulative Production", zh: "累计产量", fa: "تولید تجمعی" },
  cumProdSub: { en: "Running totals across the project", zh: "项目累计总量", fa: "مجموع تجمعی پروژه" },
  warehouse: { en: "Warehouse & WIP", zh: "仓库与在制品", fa: "انبار و کالای در جریان" },
  warehouseSub: { en: "Stocks held in process", zh: "在产库存", fa: "موجودی در فرآیند" },
  matBal: { en: "Material Balance", zh: "物料平衡", fa: "بالانس مواد" },
  matBalSub: { en: "Factory input vs output + WIP + scrap", zh: "进料 vs 出料 + 在制品 + 废料", fa: "ورودی کارخانه در برابر خروجی + WIP + ضایعات" },
  scrap: { en: "Scrap by Line", zh: "各线废料", fa: "ضایعات هر خط" },
  scrapSub: { en: "Spira & scrap totals", zh: "螺旋与废料合计", fa: "مجموع اسپیرا و ضایعات" },
  coating: { en: "Coating Weight Consumed (Zinc & Zamak)", zh: "镀层消耗(锌与扎马克)", fa: "وزن پوشش مصرفی (روی و زاماک)" },
  coatingSub: { en: "Theoretical vs actual coating with 18% dross loss", zh: "理论与实际镀层(含 18% 渣损)", fa: "پوشش نظری در برابر واقعی با ۱۸٪ تلفات سرباره" },
  thickness: { en: "Thickness (mm)", zh: "厚度 (毫米)", fa: "ضخامت (میلی‌متر)" },
  width: { en: "Width", zh: "宽度", fa: "عرض" },
  produced: { en: "Produced (ton)", zh: "产量 (吨)", fa: "تولید (تن)" },
  theoZn: { en: "Theoretical Zn (kg)", zh: "理论 Zn (千克)", fa: "روی نظری (کیلوگرم)" },
  dross: { en: "Dross (kg)", zh: "渣损 (千克)", fa: "سرباره (کیلوگرم)" },
  actualCoating: { en: "Actual coating (kg)", zh: "实际镀层 (千克)", fa: "پوشش واقعی (کیلوگرم)" },
  zincPurchased: { en: "Zinc & Zamak purchased", zh: "已采购锌与扎马克", fa: "روی و زاماک خریداری شده" },
  remaining: { en: "Remaining", zh: "剩余", fa: "باقیمانده" },
  sales: { en: "Sales Report", zh: "销售报告", fa: "گزارش فروش" },
  salesSub: { en: "Buyer transactions", zh: "买方交易", fa: "تراکنش‌های خریداران" },
  date: { en: "Date", zh: "日期", fa: "تاریخ" },
  buyer: { en: "Buyer", zh: "买方", fa: "خریدار" },
  tonnage: { en: "Tonnage", zh: "吨位", fa: "تناژ" },
  amount: { en: "Amount (rial)", zh: "金额 (里亚尔)", fa: "مبلغ (ریال)" },
  transport: { en: "Transport", zh: "运输", fa: "حمل و نقل" },
  transportSub: { en: "Loading status", zh: "装载状态", fa: "وضعیت بارگیری" },
  underLoading: { en: "Under loading", zh: "装载中", fa: "در حال بارگیری" },
  readyWarehouse: { en: "Ready in warehouse", zh: "仓库待发", fa: "آماده در انبار" },
  transportNote: {
    en: "Note: Under-loading capacity must be at least 25 ton to enable delivery to the buyer.",
    zh: "注:装载量需至少 25 吨方可交付买方。",
    fa: "توجه: ظرفیت بارگیری باید حداقل ۲۵ تن باشد تا تحویل به خریدار ممکن شود.",
  },
  plan: { en: "Production Plan", zh: "生产计划", fa: "برنامه تولید" },
  planSub: { en: "Weekly plan and execution status", zh: "周计划及执行状态", fa: "برنامه هفتگی و وضعیت اجرا" },
  tons: { en: "Tons", zh: "吨", fa: "تن" },
  status: { en: "Status", zh: "状态", fa: "وضعیت" },
  scheduled: { en: "Scheduled", zh: "计划中", fa: "برنامه‌ریزی شده" },
  notes: { en: "Notes", zh: "备注", fa: "یادداشت‌ها" },
  notesSub: { en: "Decisions & remarks", zh: "决策与说明", fa: "تصمیمات و توضیحات" },
  yieldTrend: { en: "Daily Yield Trend (Last 7 days)", zh: "每日良率趋势(最近 7 天)", fa: "روند روزانه راندمان (۷ روز اخیر)" },
  yieldTrendSub: {
    en: "Pickling / Rolling / Galvanizing yield per day to spot quality drops early",
    zh: "每日酸洗 / 轧制 / 镀锌良率,提前发现质量下降",
    fa: "راندمان روزانه اسیدشویی / نورد / گالوانیزه برای شناسایی زودهنگام افت کیفیت",
  },
  planVsActual: { en: "Plan vs Actual Production", zh: "计划 vs 实际产量", fa: "مقایسه برنامه با تولید واقعی" },
  planVsActualSub: {
    en: "Planned tonnage vs delivered tonnage per plan entry",
    zh: "各计划项的计划吨位与实际完成对比",
    fa: "تناژ برنامه‌ریزی شده در برابر تناژ تحویل شده برای هر ردیف برنامه",
  },
  planned: { en: "Planned", zh: "计划", fa: "برنامه‌ریزی شده" },
  actual: { en: "Actual", zh: "实际", fa: "واقعی" },
  delta: { en: "Variance", zh: "偏差", fa: "اختلاف" },
  totalPlanned: { en: "Total planned", zh: "计划总量", fa: "مجموع برنامه" },
  totalActual: { en: "Total actual", zh: "实际总量", fa: "مجموع واقعی" },
  achievement: { en: "Achievement", zh: "完成率", fa: "درصد تحقق" },
  generated: { en: "Generated from", zh: "生成自", fa: "تولید شده از" },
  project: { en: "Daily 2000mt project", zh: "每日 2000 吨项目", fa: "پروژه روزانه ۲۰۰۰ تن" },
  loadOk: { en: "Data loaded successfully", zh: "数据加载成功", fa: "داده‌ها با موفقیت بارگذاری شد" },
  print: { en: "Print PDF", zh: "打印 PDF", fa: "چاپ PDF" },
  theme: { en: "Theme", zh: "主题", fa: "تم" },
  kpis: { en: "Zinc Performance KPIs", zh: "锌性能 KPI", fa: "شاخص‌های عملکرد روی" },
  kpisSub: { en: "Efficiency and productivity benchmarks vs industry standard", zh: "效率与生产力对标行业标准", fa: "بازده و بهره‌وری در مقایسه با استاندارد صنعت" },
  category: { en: "Category", zh: "类别", fa: "دسته‌بندی" },
  kpi: { en: "KPI", zh: "指标", fa: "شاخص" },
  value: { en: "Value", zh: "数值", fa: "مقدار" },
  unit: { en: "Unit", zh: "单位", fa: "واحد" },
  industryStd: { en: "Industry Standard", zh: "行业标准", fa: "استاندارد صنعت" },
  catPerf: { en: "Performance", zh: "性能", fa: "عملکرد" },
  catProd: { en: "Productivity", zh: "生产力", fa: "بهره‌وری" },
  kpiZnEff: { en: "Zinc Efficiency", zh: "锌效率", fa: "بازده روی" },
  kpiZnLoss: { en: "Zinc Loss Rate", zh: "锌损失率", fa: "نرخ تلفات روی" },
  kpiZnInt: { en: "Zinc Intensity", zh: "锌强度", fa: "شدت مصرف روی" },
  kpiSteelPerZn: { en: "Steel Production per Zinc Consumption", zh: "单位锌消耗钢产量", fa: "تولید فولاد به ازای مصرف روی" },
  copyright: {
    en: "Designed and developed by Eng. Hamid Reza Fardar · Copyright © 2026, all rights reserved.",
    zh: "由 Hamid Reza Fardar 工程师设计与开发 · 版权所有 © 2026。",
    fa: "طراح و سازنده مهندس حمیدرضا فاردار · کپی‌رایت برای سازنده محفوظ است ۲۰۲۶",
  },
};

const dataTr: Record<string, Record<Lang, string>> = {
  // warehouse
  "Unpickled": { en: "Unpickled", zh: "未酸洗", fa: "اسیدشویی نشده" },
  "Pickled": { en: "Pickled", zh: "已酸洗", fa: "اسیدشویی شده" },
  "Rolled": { en: "Rolled", zh: "已轧制", fa: "نورد شده" },
  // scrap / yields
  "Rolling": { en: "Rolling", zh: "轧制", fa: "نورد" },
  "Galvanizing": { en: "Galvanizing", zh: "镀锌", fa: "گالوانیزه" },
  "Pickling Yield": { en: "Pickling Yield", zh: "酸洗良率", fa: "راندمان اسیدشویی" },
  "Rolling Yield": { en: "Rolling Yield", zh: "轧制良率", fa: "راندمان نورد" },
  "Galvanizing Yield": { en: "Galvanizing Yield", zh: "镀锌良率", fa: "راندمان گالوانیزه" },
  "Coil to Coil Yield": { en: "Coil to Coil Yield", zh: "卷到卷良率", fa: "راندمان کلاف به کلاف" },
  // material balance
  "Factory Input": { en: "Factory Input", zh: "工厂输入", fa: "ورودی کارخانه" },
  "Final Product": { en: "Final Product", zh: "最终产品", fa: "محصول نهایی" },
  "Warehouse + WIP": { en: "Warehouse + WIP", zh: "仓库 + 在制品", fa: "انبار + کالای در جریان" },
  "Warehouse + WIP − Sold": { en: "Warehouse + WIP − Sold", zh: "仓库 + 在制品 − 已售", fa: "انبار + WIP − فروش رفته" },
  "Ready to ship": { en: "Ready to ship", zh: "待发货", fa: "آماده ارسال" },
  "Total Scrap": { en: "Total Scrap", zh: "总废料", fa: "کل ضایعات" },
  // signature
  "AKA Technical Representative": { en: "AKA Technical Representative", zh: "AKA 技术代表", fa: "نماینده فنی آکا" },
  // notes
  "It has been planned that all coils will be galvanized within 4 weeks as of 2026-05-12.": {
    en: "It has been planned that all coils will be galvanized within 4 weeks as of 2026-05-12.",
    zh: "计划自 2026-05-12 起,所有卷材将在 4 周内完成镀锌。",
    fa: "برنامه‌ریزی شده است که از تاریخ ۲۰۲۶-۰۵-۱۲ همه کلاف‌ها ظرف ۴ هفته گالوانیزه شوند.",
  },
  "Every galvanized coil produced is immediately placed in the sales and shipment program.": {
    en: "Every galvanized coil produced is immediately placed in the sales and shipment program.",
    zh: "每生产一卷镀锌产品,即刻进入销售与发货计划。",
    fa: "هر کلاف گالوانیزه تولید شده بلافاصله در برنامه فروش و ارسال قرار می‌گیرد.",
  },
};
const dt = (k: string, lang: Lang) => dataTr[k]?.[lang] ?? k;

function Index() {
  const t = report.totals;
  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const tr = (k: keyof typeof translations) => translations[k as string][lang];

  useEffect(() => {
    const savedLang = (localStorage.getItem("lang") as Lang) || "en";
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setLang(savedLang);
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.classList.add("light");
    else root.classList.remove("light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  // Validate data load status
  let loadStatus: { ok: boolean; message: string } = { ok: true, message: "Data loaded successfully" };
  try {
    if (!report || !report.totals || !Array.isArray(report.daily)) {
      loadStatus = { ok: false, message: "Invalid data file structure" };
    }
  } catch (e) {
    loadStatus = { ok: false, message: "Error reading data file" };
  }
  loadStatus.message = loadStatus.ok ? tr("loadOk") : loadStatus.message;
  const lastUpdate = report.reportDate
    ? new Date(report.reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const dailyNumeric = report.daily.map((d) => ({
    date: d.date.slice(5),
    pickling: typeof d.pickling === "number" ? d.pickling : 0,
    rolling: typeof d.rolling === "number" ? d.rolling : 0,
    galv: typeof d.galv === "number" ? d.galv : 0,
    shutdown: (d.pickling as unknown) === "Shut down",
  }));

  const cumulativeNumeric = report.cumulative.map((d) => ({
    date: d.date.slice(5),
    pickling: typeof d.pickling === "number" ? d.pickling : null,
    rolling: typeof d.rolling === "number" ? d.rolling : null,
    galv: typeof d.galv === "number" ? d.galv : null,
  }));

  // Last 7 days of daily yields (pickling/input, rolling/pickling, galv/rolling)
  const yieldTrend = report.daily.slice(-7).map((d) => {
    const pickling = typeof d.pickling === "number" ? d.pickling : 0;
    const rolling = typeof d.rolling === "number" ? d.rolling : 0;
    const galv = typeof d.galv === "number" ? d.galv : 0;
    const input = typeof d.inputTon === "number" ? d.inputTon : 0;
    const pct = (num: number, den: number) => (den > 0 ? Math.min(100, +(num / den * 100).toFixed(2)) : 0);
    return {
      date: d.date.slice(5),
      picklingYield: pct(pickling, input),
      rollingYield: pct(rolling, pickling),
      galvYield: pct(galv, rolling),
    };
  });

  // Plan vs Actual: derive actual from status text ("Complete" => planned tons; else 0)
  const planVsActual = report.plan.map((p) => {
    const isComplete = typeof p.status === "string" && /complete/i.test(p.status);
    return {
      date: p.date,
      planned: p.tons ?? 0,
      actual: isComplete ? (p.tons ?? 0) : 0,
    };
  });
  const totalPlanned = planVsActual.reduce((s, p) => s + p.planned, 0);
  const totalActual = planVsActual.reduce((s, p) => s + p.actual, 0);
  const achievementPct = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-2 px-6 py-2">
          <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/40 p-1">
            <Languages className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            {(["en", "zh", "fa"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "en" ? "EN" : l === "zh" ? "中文" : "فارسی"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 text-xs font-medium text-foreground hover:bg-secondary"
            title={tr("theme")}
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Printer className="h-3.5 w-3.5" />
            {tr("print")}
          </button>
        </div>
      </div>

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
                {tr("badge")}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {tr("title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {tr("subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("reportDate")}</p>
                <p className="font-semibold tabular-nums">{new Date(report.reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("version")}</p>
                <p className="font-semibold tabular-nums">v{report.version}</p>
              </div>
              <div className="h-10 w-px bg-border" />
            </div>
          </div>
          <div
            className={`mt-6 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              loadStatus.ok
                ? "border-primary/30 bg-primary/10"
                : "border-destructive/40 bg-destructive/10"
            }`}
          >
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                loadStatus.ok ? "bg-primary animate-pulse" : "bg-destructive"
              }`}
            />
            <span className="font-medium text-foreground">
              {loadStatus.ok ? tr("statusOk") : tr("statusFail")}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{loadStatus.message}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {tr("lastUpdated")} <span className="font-semibold text-foreground tabular-nums">{lastUpdate}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label={tr("inputCoils")} value={fmt(t.inputCoilsTon, 0)} unit={tr("ton")} hint={`${t.inputCoilsQty} ${tr("coils")}`} />
          <StatCard label={tr("pickling")} value={fmt(t.pickling, 0)} unit={tr("ton")} accent="chart-2" />
          <StatCard label={tr("rolling")} value={fmt(t.rolling, 0)} unit={tr("ton")} accent="chart-4" />
          <StatCard label={tr("galvanized")} value={fmt(t.galvanized, 0)} unit={tr("ton")} accent="primary" />
          <StatCard label={tr("sold")} value={fmt(t.sold, 0)} unit={tr("ton")} accent="accent" />
          <StatCard label={tr("readyToShip")} value={fmt(report.transport.readyWarehouse, 0)} unit={tr("ton")} accent="chart-2" />
        </div>

        {/* Yields */}
        <Section title={tr("yields")} subtitle={tr("yieldsSub")}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {report.yields.map((y) => {
              const pct = y.value * 100;
              return (
                <div key={y.process} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <p className="text-sm font-medium text-foreground">{dt(y.process, lang)}</p>
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
          <Section title={tr("dailyProd")} subtitle={tr("dailyProdSub")}>
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
                  <Bar dataKey="pickling" stackId="a" fill="var(--color-chart-2)" name={tr("pickling")} />
                  <Bar dataKey="rolling" stackId="a" fill="var(--color-chart-4)" name={tr("rolling")} />
                  <Bar dataKey="galv" stackId="a" fill="var(--color-chart-1)" name={tr("galvanized")} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title={tr("cumProd")} subtitle={tr("cumProdSub")}>
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
                  <Line type="monotone" dataKey="pickling" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} name={tr("pickling")} connectNulls />
                  <Line type="monotone" dataKey="rolling" stroke="var(--color-chart-4)" strokeWidth={2} dot={false} name={tr("rolling")} connectNulls />
                  <Line type="monotone" dataKey="galv" stroke="var(--color-chart-1)" strokeWidth={2.5} dot={false} name={tr("galvanized")} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Daily Yield Trend (Last 7 days) */}
        <Section title={tr("yieldTrend")} subtitle={tr("yieldTrendSub")}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldTrend}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `${v}%`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="picklingYield" stroke="var(--color-chart-2)" strokeWidth={2} name={dt("Pickling Yield", lang)} />
                <Line type="monotone" dataKey="rollingYield" stroke="var(--color-chart-4)" strokeWidth={2} name={dt("Rolling Yield", lang)} />
                <Line type="monotone" dataKey="galvYield" stroke="var(--color-chart-1)" strokeWidth={2.5} name={dt("Galvanizing Yield", lang)} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Plan vs Actual */}
        <Section title={tr("planVsActual")} subtitle={tr("planVsActualSub")}>
          <div className="grid gap-3 md:grid-cols-3 mb-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("totalPlanned")}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{fmt0(totalPlanned)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-wider text-primary">{tr("totalActual")}</p>
              <p className="mt-1 text-2xl font-semibold text-primary tabular-nums">{fmt0(totalActual)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("achievement")}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{achievementPct.toFixed(1)}<span className="text-xs text-muted-foreground"> %</span></p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planVsActual}>
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
                <Bar dataKey="planned" fill="var(--color-chart-4)" name={tr("planned")} radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="var(--color-chart-1)" name={tr("actual")} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{tr("date")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{tr("planned")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{tr("actual")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{tr("delta")}</th>
                  <th className="py-2 font-medium">{tr("status")}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {report.plan.map((p, i) => {
                  const planned = p.tons ?? 0;
                  const actual = planVsActual[i].actual;
                  const delta = actual - planned;
                  return (
                    <tr key={i} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="py-2 pr-4 font-medium text-foreground">{p.date}</td>
                      <td className="py-2 pr-4 text-right">{fmt0(planned)}</td>
                      <td className="py-2 pr-4 text-right font-semibold text-primary">{fmt0(actual)}</td>
                      <td className={`py-2 pr-4 text-right ${delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>{delta > 0 ? "+" : ""}{fmt0(delta)}</td>
                      <td className="py-2 text-muted-foreground">{p.status || tr("scheduled")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Warehouse / Material Balance / Scrap */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Section title={tr("warehouse")} subtitle={tr("warehouseSub")}>
            <ul className="space-y-3">
              {report.warehouse.map((w) => (
                <li key={w.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
                  <span className="text-sm text-foreground">{dt(w.name, lang)}</span>
                  <span className="font-semibold tabular-nums text-primary">{fmt(w.ton)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={tr("matBal")} subtitle={tr("matBalSub")}>
            <ul className="space-y-2">
              {report.materialBalance.map((m) => (
                <li key={m.k} className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0">
                  <span className="text-muted-foreground">{dt(m.k, lang)}</span>
                  <span className="font-semibold tabular-nums text-foreground">{fmt(m.v)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={tr("scrap")} subtitle={tr("scrapSub")}>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={report.scrap.map((s) => ({ ...s, line: dt(s.line, lang) }))} dataKey="ton" nameKey="line" innerRadius={50} outerRadius={80} paddingAngle={4}>
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
        <Section title={tr("coating")} subtitle={tr("coatingSub")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">{tr("thickness")}</th>
                  <th className="py-3 pr-4 font-medium">{tr("width")}</th>
                  <th className="py-3 pr-4 text-right font-medium">{tr("produced")}</th>
                  <th className="py-3 pr-4 text-right font-medium">{tr("theoZn")}</th>
                  <th className="py-3 pr-4 text-right font-medium">{tr("dross")}</th>
                  <th className="py-3 text-right font-medium">{tr("actualCoating")}</th>
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("zincPurchased")}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{fmt(report.zincPurchased)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-primary">{tr("remaining")}</p>
              <p className="mt-1 text-xl font-semibold text-primary">{fmt(report.zincRemaining)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
            </div>
          </div>
          {/* Zinc KPIs */}
          <div className="mt-6 rounded-xl border border-border bg-secondary/20 p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{tr("kpis")}</h3>
            <p className="mb-3 text-xs text-muted-foreground">{tr("kpisSub")}</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">{tr("category")}</th>
                    <th className="py-2 pr-4 font-medium">{tr("kpi")}</th>
                    <th className="py-2 pr-4 text-right font-medium">{tr("value")}</th>
                    <th className="py-2 pr-4 font-medium">{tr("unit")}</th>
                    <th className="py-2 font-medium">{tr("industryStd")}</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {[
                    { cat: tr("catPerf"), name: tr("kpiZnEff"), value: "82", unit: "%", std: "80–88%" },
                    { cat: tr("catPerf"), name: tr("kpiZnLoss"), value: "18", unit: "%", std: "15–20%" },
                    { cat: tr("catProd"), name: tr("kpiZnInt"), value: "11.73", unit: "kg Zn/ton steel", std: "10–15 kg/ton" },
                    { cat: tr("catProd"), name: tr("kpiSteelPerZn"), value: "85.2", unit: "kg steel/kg Zn", std: "80–100" },
                  ].map((k, i) => (
                    <tr key={i} className="border-b border-border/60 hover:bg-secondary/30">
                      <td className="py-2 pr-4 text-muted-foreground">{k.cat}</td>
                      <td className="py-2 pr-4 font-medium text-foreground">{k.name}</td>
                      <td className="py-2 pr-4 text-right font-semibold text-primary">{k.value}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{k.unit}</td>
                      <td className="py-2 text-muted-foreground">{k.std}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* Sales + Transport */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Section title={tr("sales")} subtitle={tr("salesSub")}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 pr-4 font-medium">{tr("date")}</th>
                    <th className="py-3 pr-4 font-medium">{tr("buyer")}</th>
                    <th className="py-3 pr-4 text-right font-medium">{tr("tonnage")}</th>
                    <th className="py-3 text-right font-medium">{tr("amount")}</th>
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
          <Section title={tr("transport")} subtitle={tr("transportSub")}>
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{tr("underLoading")}</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">{fmt(report.transport.underLoading)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <p className="text-xs uppercase tracking-wider text-primary">{tr("readyWarehouse")}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{fmt(report.transport.readyWarehouse)} <span className="text-xs text-muted-foreground">{tr("ton")}</span></p>
              </div>
              <p className="text-xs text-muted-foreground">
                {tr("transportNote")}
              </p>
            </div>
          </Section>
        </div>

        {/* Plan */}
        <Section title={tr("plan")} subtitle={tr("planSub")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">{tr("date")}</th>
                  <th className="py-3 pr-4 font-medium">{tr("thickness")}</th>
                  <th className="py-3 pr-4 font-medium">{tr("width")}</th>
                  <th className="py-3 pr-4 text-right font-medium">{tr("tons")}</th>
                  <th className="py-3 font-medium">{tr("status")}</th>
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
                          {tr("scheduled")}
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
        <Section title={tr("notes")} subtitle={tr("notesSub")}>
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
          <p className="text-muted-foreground">{tr("copyright")}</p>
          <div className={lang === "fa" ? "text-left" : "text-right"}>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{dt(report.signature.role, lang)}</p>
            <p className="mt-0.5 font-semibold text-foreground">{report.signature.name}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
