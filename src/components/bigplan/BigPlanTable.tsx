import { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { BigPlanTheme } from "@/lib/bigPlanConstants";

interface Props {
  themes: BigPlanTheme[];
  onChange: (themes: BigPlanTheme[]) => void;
  totalJP: number;
  onCreateDetail?: (theme: BigPlanTheme) => void;
}

export function BigPlanTable({ themes, onChange, totalJP, onCreateDetail }: Props) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);

  const usedJP = themes.reduce((s, t) => s + (t.alokasiJP || 0), 0);
  const remainingJP = totalJP - usedJP;

  const updateTheme = (index: number, field: keyof BigPlanTheme, value: any) => {
    const next = [...themes];
    next[index] = { ...next[index], [field]: field === "alokasiJP" ? (parseInt(value) || 0) : value };
    onChange(next);
  };

  const addRow = () => {
    const newTheme: BigPlanTheme = {
      no: themes.length + 1,
      kelas: "",
      dimensi: "",
      tema: "",
      jenisKokurikuler: "",
      bentukKegiatan: "",
      mapelTerkait: "",
      alokasiJP: Math.max(0, Math.floor(remainingJP > 0 ? Math.min(remainingJP, Math.floor(totalJP / 10)) : 0)),
    };
    onChange([...themes, newTheme]);
  };

  const removeRow = (index: number) => {
    const next = themes.filter((_, i) => i !== index).map((t, i) => ({ ...t, no: i + 1 }));
    onChange(next);
  };

  const columns: { key: keyof BigPlanTheme; label: string; minW: string; isLong?: boolean }[] = [
    { key: "no", label: "No", minW: "min-w-[40px] w-10" },
    { key: "kelas", label: "Kelas", minW: "min-w-[60px] w-16" },
    { key: "dimensi", label: "Fokus Dimensi", minW: "min-w-[180px]", isLong: true },
    { key: "tema", label: "Tema", minW: "min-w-[160px]", isLong: true },
    { key: "jenisKokurikuler", label: "Jenis Kokurikuler", minW: "min-w-[160px]", isLong: true },
    { key: "bentukKegiatan", label: "Bentuk Kegiatan", minW: "min-w-[220px]", isLong: true },
    { key: "mapelTerkait", label: "Mapel Terkait", minW: "min-w-[140px]", isLong: true },
    { key: "alokasiJP", label: "JP", minW: "min-w-[56px] w-14" },
  ];

  const EditableCell = ({ row, col, value, isLong }: { row: number; col: keyof BigPlanTheme; value: any; isLong?: boolean }) => {
    const isEditing = editingCell?.row === row && editingCell?.col === col;
    if (col === "no") return <span className="text-xs font-bold text-muted-foreground">{value}</span>;

    if (isEditing) {
      if (isLong) {
        return (
          <Textarea
            autoFocus
            defaultValue={String(value)}
            className="text-xs border-primary p-1 min-h-[60px] resize-y"
            rows={3}
            onBlur={(e) => {
              updateTheme(row, col, e.target.value);
              setEditingCell(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditingCell(null);
            }}
          />
        );
      }
      return (
        <Input
          autoFocus
          defaultValue={String(value)}
          type={col === "alokasiJP" ? "number" : "text"}
          className="h-7 text-xs border-primary p-1"
          onBlur={(e) => {
            updateTheme(row, col, e.target.value);
            setEditingCell(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateTheme(row, col, (e.target as HTMLInputElement).value);
              setEditingCell(null);
            }
            if (e.key === "Escape") setEditingCell(null);
          }}
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell({ row, col })}
        className="cursor-pointer text-xs min-h-[28px] p-1 rounded hover:bg-accent/30 transition-colors whitespace-normal break-words line-clamp-4"
        title={String(value)}
      >
        {value || <span className="text-muted-foreground italic">klik untuk isi</span>}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* JP Summary */}
      <div className="flex items-center gap-3 text-sm">
        <span className="neo-badge bg-primary text-primary-foreground">
          Total: {usedJP} / {totalJP} JP
        </span>
        {remainingJP !== 0 && (
          <span className={`neo-badge ${remainingJP > 0 ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"}`}>
            {remainingJP > 0 ? `Sisa: ${remainingJP} JP` : `Kelebihan: ${Math.abs(remainingJP)} JP`}
          </span>
        )}
        {remainingJP === 0 && totalJP > 0 && (
          <span className="neo-badge bg-success text-success-foreground">✓ JP Terpenuhi</span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-2 border-foreground rounded-lg">
        <table className="w-full text-sm table-fixed" style={{ minWidth: "900px" }}>
          <thead>
            <tr className="bg-secondary border-b-2 border-foreground">
              {columns.map((c) => (
                <th key={c.key} className={`${c.minW} px-2 py-2 text-left text-xs font-extrabold uppercase tracking-wider text-foreground`}>
                  {c.label}
                </th>
              ))}
              <th className="min-w-[60px] w-16 px-2 py-2 text-center text-xs font-extrabold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {themes.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Belum ada tema. Klik "Generate dengan AI" atau tambah baris manual.
                </td>
              </tr>
            ) : (
              themes.map((theme, i) => (
                <tr key={i} className="border-b border-foreground/20 hover:bg-muted/30 transition-colors align-top">
                  {columns.map((c) => (
                    <td key={c.key} className={`${c.minW} px-2 py-1.5`}>
                      <EditableCell row={i} col={c.key} value={theme[c.key]} isLong={c.isLong} />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onCreateDetail && (
                        <button
                          onClick={() => onCreateDetail(theme)}
                          className="p-1 hover:bg-primary/10 rounded transition-colors"
                          title="Buat Perencanaan Detail"
                        >
                          <FileText size={14} className="text-primary" />
                        </button>
                      )}
                      <button
                        onClick={() => removeRow(i)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="border-2 border-foreground">
        <Plus size={14} /> Tambah Baris
      </Button>
    </div>
  );
}
