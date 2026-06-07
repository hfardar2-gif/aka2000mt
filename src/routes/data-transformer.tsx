import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import reportData from "@/data/report.json";

export const Route = createFileRoute("/data-transformer")({
  component: DataTransformerPage,
});

const PASSWORD = "AKA";

type AnyObj = Record<string, any>;

const inputCls =
  "w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

const parseNum = (v: string) => (v === "" ? 0 : isNaN(Number(v)) ? v : Number(v));

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: any;
  type?: "text" | "number";
  onChange: (v: any) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        className={inputCls + " mt-1"}
        value={value ?? ""}
        onChange={(e) => onChange(type === "number" ? parseNum(e.target.value) : e.target.value)}
      />
    </label>
  );
}

function ArrayTable({
  arr,
  columns,
  onUpdate,
  onRemove,
  onAdd,
}: {
  arr: AnyObj[];
  columns: { key: string; label: string; type?: "text" | "number" }[];
  onUpdate: (i: number, key: string, v: any) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className="px-2 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {arr.map((row, i) => (
              <tr key={i} className="border-b border-border/50">
                {columns.map((c) => (
                  <td key={c.key} className="px-2 py-1">
                    <input
                      className={inputCls}
                      value={row[c.key] ?? ""}
                      onChange={(e) =>
                        onUpdate(i, c.key, c.type === "number" ? parseNum(e.target.value) : e.target.value)
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1">
                  <button
                    onClick={() => onRemove(i)}
                    className="text-xs rounded-md bg-destructive text-destructive-foreground px-2 py-1 hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={onAdd}
        className="text-xs rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 hover:bg-secondary/80"
      >
        + Add Row
      </button>
    </div>
  );
}

function DataTransformerPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [data, setData] = useState<AnyObj>(() => JSON.parse(JSON.stringify(reportData)));

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pwd === PASSWORD) {
              setAuthed(true);
              setErr("");
            } else {
              setErr("Incorrect password");
            }
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <h1 className="text-xl font-semibold text-foreground mb-4">Data Transformer Login</h1>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          {err && <p className="text-xs text-destructive mb-2">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  const update = (path: (string | number)[], value: any) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  const addRow = (key: string, template: AnyObj | string) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key] = [...(next[key] ?? []), typeof template === "string" ? template : { ...template }];
      return next;
    });
  };

  const removeRow = (key: string, idx: number) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[key] = next[key].filter((_: any, i: number) => i !== idx);
      return next;
    });
  };

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-export-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseNum = (v: string) => (v === "" ? 0 : isNaN(Number(v)) ? v : Number(v));

  const inputCls =
    "w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-foreground mb-4">{title}</h2>
      {children}
    </section>
  );

  const ArrayTable = ({
    arrKey,
    columns,
    template,
  }: {
    arrKey: string;
    columns: { key: string; label: string; type?: "text" | "number" }[];
    template: AnyObj;
  }) => {
    const arr: AnyObj[] = data[arrKey] ?? [];
    return (
      <div className="space-y-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} className="px-2 py-2 font-medium">
                    {c.label}
                  </th>
                ))}
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {arr.map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-1">
                      <input
                        className={inputCls}
                        value={row[c.key] ?? ""}
                        onChange={(e) =>
                          update(
                            [arrKey, i, c.key],
                            c.type === "number" ? parseNum(e.target.value) : e.target.value,
                          )
                        }
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <button
                      onClick={() => removeRow(arrKey, i)}
                      className="text-xs rounded-md bg-destructive text-destructive-foreground px-2 py-1 hover:bg-destructive/90"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => addRow(arrKey, template)}
          className="text-xs rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 hover:bg-secondary/80"
        >
          + Add Row
        </button>
      </div>
    );
  };

  const Field = ({
    label,
    path,
    value,
    type = "text",
  }: {
    label: string;
    path: (string | number)[];
    value: any;
    type?: "text" | "number";
  }) => (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        className={inputCls + " mt-1"}
        value={value ?? ""}
        onChange={(e) => update(path, type === "number" ? parseNum(e.target.value) : e.target.value)}
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Data Transformer</h1>
            <p className="text-sm text-muted-foreground">Edit all report fields and export as JSON.</p>
          </div>
          <button
            onClick={handleExport}
            className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            تایید نهایی و ذخیره JSON
          </button>
        </header>

        <Card title="Meta">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Report Date" path={["reportDate"]} value={data.reportDate} />
            <Field label="Version" path={["version"]} value={data.version} />
            <Field label="Zinc Purchased" path={["zincPurchased"]} value={data.zincPurchased} type="number" />
            <Field label="Zinc Remaining" path={["zincRemaining"]} value={data.zincRemaining} type="number" />
          </div>
        </Card>

        {data.totals && (
          <Card title="Totals">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.totals).map(([k, v]) => (
                <Field key={k} label={k} path={["totals", k]} value={v} type="number" />
              ))}
            </div>
          </Card>
        )}

        {data.transport && (
          <Card title="Transport">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.transport).map(([k, v]) => (
                <Field key={k} label={k} path={["transport", k]} value={v} type="number" />
              ))}
            </div>
          </Card>
        )}

        {data.signature && (
          <Card title="Signature">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.signature).map(([k, v]) => (
                <Field key={k} label={k} path={["signature", k]} value={v} />
              ))}
            </div>
          </Card>
        )}

        <Card title="Warehouse">
          <ArrayTable
            arrKey="warehouse"
            columns={[
              { key: "name", label: "Name" },
              { key: "ton", label: "Ton", type: "number" },
            ]}
            template={{ name: "", ton: 0 }}
          />
        </Card>

        <Card title="Scrap">
          <ArrayTable
            arrKey="scrap"
            columns={[
              { key: "line", label: "Line" },
              { key: "ton", label: "Ton", type: "number" },
            ]}
            template={{ line: "", ton: 0 }}
          />
        </Card>

        <Card title="Material Balance">
          <ArrayTable
            arrKey="materialBalance"
            columns={[
              { key: "k", label: "Key" },
              { key: "v", label: "Value", type: "number" },
            ]}
            template={{ k: "", v: 0 }}
          />
        </Card>

        <Card title="Yields">
          <ArrayTable
            arrKey="yields"
            columns={[
              { key: "process", label: "Process" },
              { key: "formula", label: "Formula" },
              { key: "value", label: "Value", type: "number" },
            ]}
            template={{ process: "", formula: "", value: 0 }}
          />
        </Card>

        <Card title="Daily">
          <ArrayTable
            arrKey="daily"
            columns={[
              { key: "date", label: "Date" },
              { key: "inputTon", label: "Input Ton", type: "number" },
              { key: "inputQty", label: "Input Qty", type: "number" },
              { key: "pickling", label: "Pickling", type: "number" },
              { key: "rolling", label: "Rolling", type: "number" },
              { key: "galv", label: "Galv", type: "number" },
            ]}
            template={{ date: "", inputTon: 0, inputQty: 0, pickling: 0, rolling: 0, galv: 0 }}
          />
        </Card>

        <Card title="Cumulative">
          <ArrayTable
            arrKey="cumulative"
            columns={[
              { key: "date", label: "Date" },
              { key: "inputTon", label: "Input Ton", type: "number" },
              { key: "inputQty", label: "Input Qty", type: "number" },
              { key: "pickling", label: "Pickling", type: "number" },
              { key: "rolling", label: "Rolling", type: "number" },
              { key: "galv", label: "Galv", type: "number" },
              { key: "sold", label: "Sold", type: "number" },
            ]}
            template={{ date: "", inputTon: 0, inputQty: 0, pickling: 0, rolling: 0, galv: 0, sold: 0 }}
          />
        </Card>

        <Card title="Coating">
          <ArrayTable
            arrKey="coating"
            columns={[
              { key: "thickness", label: "Thickness", type: "number" },
              { key: "width", label: "Width", type: "number" },
              { key: "weight", label: "Weight", type: "number" },
              { key: "theoZn", label: "Theo Zn", type: "number" },
              { key: "dross", label: "Dross", type: "number" },
              { key: "actual", label: "Actual", type: "number" },
            ]}
            template={{ thickness: 0, width: 1000, weight: 0, theoZn: 0, dross: 0, actual: 0 }}
          />
        </Card>

        <Card title="Sales">
          <ArrayTable
            arrKey="sales"
            columns={[
              { key: "date", label: "Date" },
              { key: "buyer", label: "Buyer" },
              { key: "tonnage", label: "Tonnage", type: "number" },
              { key: "amount", label: "Amount", type: "number" },
            ]}
            template={{ date: "", buyer: "", tonnage: 0, amount: 0 }}
          />
        </Card>

        <Card title="Plan">
          <ArrayTable
            arrKey="plan"
            columns={[
              { key: "date", label: "Date" },
              { key: "thickness", label: "Thickness" },
              { key: "width", label: "Width", type: "number" },
              { key: "tons", label: "Tons", type: "number" },
              { key: "status", label: "Status" },
            ]}
            template={{ date: "", thickness: "", width: 1000, tons: 0, status: "" }}
          />
        </Card>

        <Card title="Notes">
          <div className="space-y-2">
            {(data.notes ?? []).map((n: any, i: number) => {
              const isObj = typeof n === "object" && n !== null;
              const val = isObj ? n.note ?? "" : n;
              return (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={val}
                    onChange={(e) =>
                      update(["notes", i], isObj ? { ...n, note: e.target.value } : e.target.value)
                    }
                  />
                  <button
                    onClick={() => removeRow("notes", i)}
                    className="text-xs rounded-md bg-destructive text-destructive-foreground px-2 py-1 hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            <button
              onClick={() => addRow("notes", "")}
              className="text-xs rounded-md bg-secondary text-secondary-foreground px-3 py-1.5 hover:bg-secondary/80"
            >
              + Add Note
            </button>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleExport}
            className="rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90"
          >
            تایید نهایی و ذخیره JSON
          </button>
        </div>
      </div>
    </div>
  );
}