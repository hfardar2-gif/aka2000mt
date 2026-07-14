import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent, type ReactNode } from "react";
import reportData from "@/data/report.json";
import { importReportWorkbook } from "@/lib/xlsx-import";

export const Route = createFileRoute("/data-transformer")({
  head: () => ({
    meta: [
      { title: "AKA Project Report — Data Entry" },
      {
        name: "description",
        content: "Excel import, data entry and JSON export for the AKA Project Report.",
      },
    ],
  }),
  component: DataTransformerPage,
});

const PASSWORD = "AKA";
type AnyObj = Record<string, any>;
type FieldType = "text" | "number";
type ColumnDefinition = { key: string; label: string; type?: FieldType };
type ImportMessage = { tone: "success" | "error" | "info"; text: string };

type ArraySection = {
  key: string;
  title: string;
  description?: string;
  columns: ColumnDefinition[];
  template: AnyObj;
};

const inputCls =
  "w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring";

const parseNum = (value: string) =>
  value === "" ? 0 : Number.isNaN(Number(value)) ? value : Number(value);

const ARRAY_SECTIONS: ArraySection[] = [
  {
    key: "coilInventory",
    title: "Coil Inventory",
    description:
      "Available coil stock by thickness, width and tonnage. Excel sheet: Coil Inventory.",
    columns: [
      { key: "thickness", label: "Thickness (mm)", type: "number" },
      { key: "width", label: "Width (mm)", type: "number" },
      { key: "tonnage", label: "Available Tonnage", type: "number" },
    ],
    template: { thickness: 0, width: 1000, tonnage: 0 },
  },
  {
    key: "warehouse",
    title: "Warehouse",
    columns: [
      { key: "name", label: "Name" },
      { key: "ton", label: "Ton", type: "number" },
    ],
    template: { name: "", ton: 0 },
  },
  {
    key: "scrap",
    title: "Scrap",
    columns: [
      { key: "line", label: "Line" },
      { key: "ton", label: "Ton", type: "number" },
    ],
    template: { line: "", ton: 0 },
  },
  {
    key: "materialBalance",
    title: "Material Balance",
    columns: [
      { key: "k", label: "Key" },
      { key: "v", label: "Value", type: "number" },
    ],
    template: { k: "", v: 0 },
  },
  {
    key: "yields",
    title: "Yields",
    columns: [
      { key: "process", label: "Process" },
      { key: "formula", label: "Formula" },
      { key: "value", label: "Value", type: "number" },
    ],
    template: { process: "", formula: "", value: 0 },
  },
  {
    key: "daily",
    title: "Daily",
    columns: [
      { key: "date", label: "Date" },
      { key: "inputTon", label: "Input Ton", type: "number" },
      { key: "inputQty", label: "Input Qty", type: "number" },
      { key: "pickling", label: "Pickling", type: "number" },
      { key: "rolling", label: "Rolling", type: "number" },
      { key: "galv", label: "Galv", type: "number" },
    ],
    template: {
      date: "",
      inputTon: 0,
      inputQty: 0,
      pickling: 0,
      rolling: 0,
      galv: 0,
    },
  },
  {
    key: "cumulative",
    title: "Cumulative",
    columns: [
      { key: "date", label: "Date" },
      { key: "inputTon", label: "Input Ton", type: "number" },
      { key: "inputQty", label: "Input Qty", type: "number" },
      { key: "pickling", label: "Pickling", type: "number" },
      { key: "rolling", label: "Rolling", type: "number" },
      { key: "galv", label: "Galv", type: "number" },
      { key: "sold", label: "Sold", type: "number" },
    ],
    template: {
      date: "",
      inputTon: 0,
      inputQty: 0,
      pickling: 0,
      rolling: 0,
      galv: 0,
      sold: 0,
    },
  },
  {
    key: "coating",
    title: "Coating",
    columns: [
      { key: "thickness", label: "Thickness", type: "number" },
      { key: "width", label: "Width", type: "number" },
      { key: "weight", label: "Weight", type: "number" },
      { key: "theoZn", label: "Theo Zn", type: "number" },
      { key: "dross", label: "Dross", type: "number" },
      { key: "actual", label: "Actual", type: "number" },
    ],
    template: {
      thickness: 0,
      width: 1000,
      weight: 0,
      theoZn: 0,
      dross: 0,
      actual: 0,
    },
  },
  {
    key: "sales",
    title: "Sales",
    columns: [
      { key: "date", label: "Date" },
      { key: "buyer", label: "Buyer" },
      { key: "tonnage", label: "Tonnage", type: "number" },
      { key: "amount", label: "Amount", type: "number" },
    ],
    template: { date: "", buyer: "", tonnage: 0, amount: 0 },
  },
  {
    key: "plan",
    title: "Plan",
    columns: [
      { key: "date", label: "Date" },
      { key: "thickness", label: "Thickness" },
      { key: "width", label: "Width", type: "number" },
      { key: "tons", label: "Tons", type: "number" },
      { key: "status", label: "Status" },
    ],
    template: { date: "", thickness: "", width: 1000, tons: 0, status: "" },
  },
];

const MANAGEMENT_SECTIONS = [
  ["overall", "Overall Project Status"],
  ["production", "Production Status"],
  ["sales", "Sales Status"],
  ["inventory", "Inventory Status"],
  ["keyNote", "Key Management Note"],
] as const;

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mb-4 mt-1 text-xs text-muted-foreground">{description}</p>
      ) : (
        <div className="mb-4" />
      )}
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
  type?: FieldType;
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
  columns: ColumnDefinition[];
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
          No rows entered yet. Upload Excel or select “Add Row”.
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
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);
  const [data, setData] = useState<AnyObj>(() => createInitialData());

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
            Enter the password to import or edit project report data.
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
        const segment = path[index];
        if (current[segment] === undefined || current[segment] === null) {
          current[segment] = typeof path[index + 1] === "number" ? [] : {};
        }
        current = current[segment];
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
      next[key] = (next[key] ?? []).filter(
        (_: unknown, rowIndex: number) => rowIndex !== index,
      );
      return next;
    });
  };

  const handleExcelImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportMessage({ tone: "info", text: `Reading ${file.name}…` });
    try {
      const result = await importReportWorkbook(file, data);
      setData(result.data);
      const warningText = result.warnings.length
        ? ` Warnings: ${result.warnings.join(" ")}`
        : "";
      setImportMessage({
        tone: "success",
        text: `Excel import completed. ${result.importedSections.length} report sections were populated: ${result.importedSections.join(", ")}.${warningText} Review the fields below before exporting or publishing.`,
      });
    } catch (importError) {
      setImportMessage({
        tone: "error",
        text:
          importError instanceof Error
            ? importError.message
            : "The Excel workbook could not be imported.",
      });
    } finally {
      setImporting(false);
    }
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

  const renderArray = (section: ArraySection) => (
    <ArrayTable
      arr={(data[section.key] ?? []) as AnyObj[]}
      columns={section.columns}
      onUpdate={(index, key, value) => update([section.key, index, key], value)}
      onRemove={(index) => removeRow(section.key, index)}
      onAdd={() => addRow(section.key, section.template)}
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
              Import the official Excel workbook, review the mapped fields, and export the report JSON.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setData(createInitialData());
                setImportMessage({ tone: "info", text: "The form was reset to the currently deployed report data." });
              }}
              className="rounded-md border border-border bg-secondary/40 px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Final Approval & Export JSON
            </button>
          </div>
        </header>

        <Card
          title="Import Excel Workbook"
          description="Select the official AKA .xlsx template. The system reads recognized sheets and fills the matching fields automatically. Blank sheets do not erase the currently loaded data."
        >
          <div className="flex flex-wrap items-center gap-3">
            <label
              className={`inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 ${importing ? "pointer-events-none opacity-60" : ""}`}
            >
              {importing ? "Reading Excel…" : "Choose Excel File"}
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                disabled={importing}
                onChange={handleExcelImport}
              />
            </label>
            <span className="text-xs text-muted-foreground">
              Maximum size: 15 MB · Chrome or Edge recommended
            </span>
          </div>

          {importMessage && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                importMessage.tone === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : importMessage.tone === "error"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-primary/10 text-foreground"
              }`}
            >
              {importMessage.text}
            </div>
          )}

          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            <li>Do not rename workbook sheets, column headers, or Key values.</li>
            <li>Enter dates as YYYY-MM-DD and leave unused table rows completely blank.</li>
            <li>Import only fills sections that contain data; other existing sections remain unchanged.</li>
          </ul>
        </Card>

        <Card title="Meta">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Report Date"
              value={data.reportDate}
              onChange={(value) => update(["reportDate"], value)}
            />
            <Field
              label="Version"
              value={data.version}
              onChange={(value) => update(["version"], value)}
            />
            <Field
              label="Zinc Purchased"
              value={data.zincPurchased}
              type="number"
              onChange={(value) => update(["zincPurchased"], value)}
            />
            <Field
              label="Zinc Remaining"
              value={data.zincRemaining}
              type="number"
              onChange={(value) => update(["zincRemaining"], value)}
            />
          </div>
        </Card>

        {data.totals && (
          <Card
            title="Totals"
            description="Includes input coil tonnage and input coil count used by the main dashboard cards."
          >
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
            {MANAGEMENT_SECTIONS.map(([key, label]) => (
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

        {ARRAY_SECTIONS.map((section) => (
          <Card
            key={section.key}
            title={section.title}
            description={section.description}
          >
            {renderArray(section)}
          </Card>
        ))}

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

function createInitialData() {
  const initial = JSON.parse(JSON.stringify(reportData)) as AnyObj;
  initial.coilInventory = initial.coilInventory ?? [];
  initial.managementCommentary = initial.managementCommentary ?? {};
  return initial;
}
