import { History, ChevronDown, Save, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContentHistory, type ContentHistoryItem } from "@/hooks/useContentHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderHistoryDropdownProps {
  selectedHistoryId: string | null;
  hasContent: boolean;
  onLoad: (item: ContentHistoryItem) => void;
  onSaveNew: () => void;
  onDelete: () => void;
  onDeselect: () => void;
}

export function HeaderHistoryDropdown({
  selectedHistoryId, hasContent, onLoad, onSaveNew, onDelete, onDeselect,
}: HeaderHistoryDropdownProps) {
  const { data: items = [], isLoading } = useContentHistory();
  const selected = items.find((i) => i.id === selectedHistoryId);

  const getIndicators = (item: ContentHistoryItem) => {
    const ind: string[] = [];
    if (item.modul_data) ind.push("M");
    return ind;
  };

  const truncate = (s: string, n: number) => s.length > n ? s.slice(0, n) + "…" : s;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-2 border-foreground/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-xs gap-1.5">
          <History size={14} />
          <span className="hidden sm:inline">{selected ? truncate(selected.name, 18) : "Riwayat"}</span>
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 border-2 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Riwayat Konten</span>
          {isLoading && <Loader2 size={12} className="animate-spin" />}
        </DropdownMenuLabel>

        <div className="max-h-[200px] overflow-y-auto">
          {selectedHistoryId && (
            <DropdownMenuItem onClick={onDeselect} className="text-xs text-muted-foreground">
              <X size={12} className="mr-1" /> -- Batal Pilih --
            </DropdownMenuItem>
          )}
          {items.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={() => onLoad(item)}
                    className={`text-xs cursor-pointer ${item.id === selectedHistoryId ? "bg-accent" : ""}`}
                  >
                    <span className="truncate flex-1">{truncate(item.name, 22)}</span>
                    <span className="flex gap-0.5 ml-1">
                      {getIndicators(item).map((ind) => (
                        <span key={ind} className="bg-primary/10 text-primary text-[9px] font-bold px-1 rounded">{ind}</span>
                      ))}
                    </span>
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-muted-foreground">{new Date(item.updated_at).toLocaleDateString("id-ID")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {!isLoading && items.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-3">Belum ada riwayat</div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSaveNew} disabled={!hasContent} className="text-xs">
          <Save size={12} className="mr-1.5" /> Simpan Riwayat Baru
        </DropdownMenuItem>
        {selectedHistoryId && (
          <DropdownMenuItem onClick={onDelete} className="text-xs text-destructive focus:text-destructive">
            <Trash2 size={12} className="mr-1.5" /> Hapus Riwayat Terpilih
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
