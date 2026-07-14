import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import reportData from "@/data/report.json";

export const Route = createFileRoute("/data-transformer")({
  head: () => ({
    meta: [
      { title: "AKA Project Report — Data Entry" },
      { name: "description", content: "Data entry and JSON export for the AKA Project Report." },
    ],
  }),
  component: DataTransformerPage,
});

const PASSWORD = "AKA";
type AnyObj = Record<string, any>;

const inputCls =
  "w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

const parseNum = (value: string) =>
  value === "" ? 0 : Number.isNaN(Number(value)) ? value : Number(value);

function Card({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mb-4 mt-1 text-xs text-muted-foreground">{description}</p>}
      {!description && <div className="mb-4" />}
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
  onChange: (value: any) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        className={`${inputCls} mt-1`}
        value={value ?? ""}
        onChange={(event) =>
          onChange(type === "number" ? parseNum(event.target.value) : event.target.value)
        }
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
  onUpdate: (index: number, key: string, value: any) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 font-medium">
                  {column.label}
                </th>
              ))}
              <th className="px-2 py-2 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {arr.map((row, index) => (
              <tr key={index} className="border-b border-border/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-1">
                    <input
                      type={column.type ?? "text"}
                      step={column.type === "number" ? "any" : undefined}
                      className={inputCls}
                      value={row[column.key] ?? ""}
                      onChange={(event) =>
                        onUpdate(
                          index,
                          column.key,
                          column.type === "number"
                            ? parseNum(event.target.value)
                            : event.target.value,
                        )
                      }
                    />
                  </td>
                ))}
                <td className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {arr.length === 0 && (
        <p className="rounded-md border border-dashed border-border px-3 py-3 text-xs italic text-muted-foreground">
          No rows entered yet. Select “Add Row” to create the first record.
        </p>
      )}
      <button
        type="button"
        onClick={onAdd}
        className="rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/80"
      >
        + Add Row
      </button>
    </div>
  );
}

function DataTransformerPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<AnyObj>(() => {
    const initial = JSON.parse(JSON.stringify(reportData)) as AnyObj;
    initial.coilInventory = initial.coilInventory ?? [];
    return initial;
  });

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (password === PASSWORD) {
              setAuthed(true);
              setError("");
            } else {
              setError("Incorrect password");
            }
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            AKA Project Report
          </p>
          <h1 className="mb-1 text-xl font-semibold text-foreground">Data Entry Login</h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter the password to update project report data.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="mb-3 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  const update = (path: (string | number)[], value: any) => {
    setData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      let current: any = next;
      for (let index = 0; index < path.length - 1; index += 1) {
        current = current[path[index]];
      }
      current[path[path.length - 1]] = value;
      return next;
    });
  };

  const addRow = (key: string, template: AnyObj | string) => {
    setData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next[key] = [
        ...(next[key] ?? []),
        typeof template === "string" ? template : { ...template },
      ];
      return next;
    });
  };

  const removeRow = (key: string, index: number) => {
    setData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next[key] = (next[key] ?? []).filter((_: unknown, rowIndex: number) => rowIndex !== index);
      return next;
    });
  };

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `report-export-${today}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const renderArray = (
    arrayKey: string,
    columns: { key: string; label: string; type?: "text" | "number" }[],
    template: AnyObj,
  ) => (
    <ArrayTable
      arr={(data[arrayKey] ?? []) as AnyObj[]}
      columns={columns}
      onUpdate={(index, key, value) => update([arrayKey, index, key], value)}
      onRemove={(index) => removeRow(arrayKey, index)}
      onAdd={() => addRow(arrayKey, template)}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              AKA Project Report
            </p>
            <h1 className="text-2xl font-semibold">Data Entry</h1>
            <p className="text-sm text-muted-foreground">
              Edit report fields and export the completed data as JSON.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Final Approval & Export JSON
          </button>
        </header>

        <Card title="Meta">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Report Date" value={data.reportDate} onChange={(value) => update(["reportDate"], value)} />
            <Field label="Version" value={data.version} onChange={(value) => update(["version"], value)} />
            <Field label="Zinc Purchased" value={data.zincPurchased} type="number" onChange={(value) => update(["zincPurchased"], value)} />
            <Field label="Zinc Remaining" value={data.zincRemaining} type="number" onChange={(value) => update(["zincRemaining"], value)} />
          </div>
        </Card>

        {data.totals && (
          <Card title="Totals" description="Includes input coil tonnage and input coil count used by the main dashboard cards.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Object.entries(data.totals).map(([key, value]) => (
                <Field
                  key={key}
                  label={key}
                  value={value}
                  type="number"
                  onChange={(nextValue) => update(["totals", key], nextValue)}
                />
              ))}
            </div>
          </Card>
        )}

        <Card
          title="Coil Inventory"
          description="Enter available coil stock by thickness, width and available tonnage. This table is shown as “Coil Inventory” on the dashboard."
        >
          {renderArray(
            "coilInventory",
            [
              { key: "thickness", label: "Thickness (mm)", type: "number" },
              { key: "width", label: "Width (mm)", type: "number" },
              { key: "tonnage", label: "Available Tonnage", type: "number" },
            ],
            { thickness: 0, width: 1000, tonnage: 0 },
          )}
        </Card>

        {data.transport && (
          <Card title="Transport">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.transport).map(([key, value]) => (
                <Field
                  key={key}
                  label={key}
                  value={value}
                  type="number"
                  onChange={(nextValue) => update(["transport", key], nextValue)}
                />
              ))}
            </div>
          </Card>
        )}

        {data.signature && (
          <Card title="Signature">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(data.signature).map(([key, value]) => (
                <Field
                  key={key}
                  label={key}
                  value={value}
                  onChange={(nextValue) => update(["signature", key], nextValue)}
                />
              ))}
            </div>
          </Card>
        )}

        <Card title="Project Analysis">
          <label className="block">
            <span className="text-xs text-muted-foreground">
              Project analysis shown in the dashboard modal
            </span>
            <textarea
              className={`${inputCls} mt-1 min-h-[160px] font-mono text-xs leading-relaxed`}
              value={data.projectAnalysis ?? ""}
              onChange={(event) => update(["projectAnalysis"], event.target.value)}
              placeholder="Enter the project analysis…"
            />
          </label>
        </Card>

        <Card title="Management Commentary">
          <div className="grid grid-cols-1 gap-4">
            {[
              ["overall", "Overall Project Status"],
              ["production", "Production Status"],
              ["sales", "Sales Status"],
              ["inventory", "Inventory Status"],
              ["keyNote", "Key Management Note"],
            ].map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-xs text-muted-foreground">{label}</span>
                <textarea
                  className={`${inputCls} mt-1 min-h-[80px] text-sm leading-relaxed`}
                  value={data.managementCommentary?.[key] ?? ""}
                  onChange={(event) =>
                    update(["managementCommentary", key], event.target.value)
                  }
                />
              </label>
            ))}
          </div>
        </Card>

        <Card title="Warehouse">
          {renderArray(
            "warehouse",
            [
              { key: "name", label: "Name" },
              { key: "ton", label: "Ton", type: "number" },
            ],
            { name: "", ton: 0 },
          )}
        </Card>

        <Card title="Scrap">
          {renderArray(
            "scrap",
            [
              { key: "line", label: "Line" },
              { key: "ton", label: "Ton", type: "number" },
            ],
            { line: "", ton: 0 },
          )}
        </Card>

        <Card title="Material Balance">
          {renderArray(
            "materialBalance",
            [
              { key: "k", label: "Key" },
              { key: "v", label: "Value", type: "number" },
            ],
            { k: "", v: 0 },
          )}
        </Card>

        <Card title="Yields">
          {renderArray(
            "yields",
            [
              { key: "process", label: "Process" },
              { key: "formula", label: "Formula" },
              { key: "value", label: "Value", type: "number" },
            ],
            { process: "", formula: "", value: 0 },
          )}
        </Card>

        <Card title="Daily">
          {renderArray(
            "daily",
            [
              { key: "date", label: "Date" },
              { key: "inputTon", label: "Input Ton", type: "number" },
              { key: "inputQty", label: "Input Qty", type: "number" },
              { key: "pickling", label: "Pickling", type: "number" },
              { key: "rolling", label: "Rolling", type: "number" },
              { key: "galv", label: "Galv", type: "number" },
            ],
            { date: "", inputTon: 0, inputQty: 0, pickling: 0, rolling: 0, galv: 0 },
          )}
        </Card>

        <Card title="Cumulative">
          {renderArray(
            "cumulative",
            [
              { key: "date", label: "Date" },
              { key: "inputTon", label: "Input Ton", type: "number" },
              { key: "inputQty", label: "Input Qty", type: "number" },
              { key: "pickling", label: "Pickling", type: "number" },
              { key: "rolling", label: "Rolling", type: "number" },
              { key: "galv", label: "Galv", type: "number" },
              { key: "sold", label: "Sold", type: "number" },
            ],
            {
              date: "",
              inputTon: 0,
              inputQty: 0,
              pickling: 0,
              rolling: 0,
              galv: 0,
              sold: 0,
            },
          )}
        </Card>

        <Card title="Coating">
          {renderArray(
            "coating",
            [
              { key: "thickness", label: "Thickness", type: "number" },
              { key: "width", label: "Width", type: "number" },
              { key: "weight", label: "Weight", type: "number" },
              { key: "theoZn", label: "Theo Zn", type: "number" },
              { key: "dross", label: "Dross", type: "number" },
              { key: "actual", label: "Actual", type: "number" },
            ],
            { thickness: 0, width: 1000, weight: 0, theoZn: 0, dross: 0, actual: 0 },
          )}
        </Card>

        <Card title="Sales">
          {renderArray(
            "sales",
            [
              { key: "date", label: "Date" },
              { key: "buyer", label: "Buyer" },
              { key: "tonnage", label: "Tonnage", type: "number" },
              { key: "amount", label: "Amount", type: "number" },
            ],
            { date: "", buyer: "", tonnage: 0, amount: 0 },
          )}
        </Card>

        <Card title="Plan">
          {renderArray(
            "plan",
            [
              { key: "date", label: "Date" },
              { key: "thickness", label: "Thickness" },
              { key: "width", label: "Width", type: "number" },
              { key: "tons", label: "Tons", type: "number" },
              { key: "status", label: "Status" },
            ],
            { date: "", thickness: "", width: 1000, tons: 0, status: "" },
          )}
        </Card>

        <Card title="Notes">
          <div className="space-y-2">
            {(data.notes ?? []).map((note: any, index: number) => {
              const isObject = typeof note === "object" && note !== null;
              const value = isObject ? note.note ?? "" : note;
              return (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={value}
                    onChange={(event) =>
                      update(
                        ["notes", index],
                        isObject ? { ...note, note: event.target.value } : event.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeRow("notes", index)}
                    className="rounded-md bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => addRow("notes", "")}
              className="rounded-md bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/80"
            >
              + Add Note
            </button>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Final Approval & Export JSON
          </button>
        </div>
      </div>
    </div>
  );
}
