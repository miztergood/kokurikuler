import { useState, useMemo } from "react";
import { Copy, Check, ImageIcon, ArrowLeft, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormData } from "@/lib/constants";
import {
  designStyles,
  generateTitleOptions,
  generateIllustrationSuggestion,
  buildCoverPromptJSON,
  CoverTextElements,
} from "@/lib/coverPromptData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
}

export function CoverPromptModal({ open, onOpenChange, formData }: Props) {
  const [step, setStep] = useState<"options" | "result">("options");
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [textElements, setTextElements] = useState<CoverTextElements>({
    namaSekolah: true,
    kelasFase: true,
    judulKegiatan: true,
    namaPenyusun: true,
    tahunAjaran: true,
    jenjang: true,
    tema: true,
  });

  const titleOptions = useMemo(() => generateTitleOptions(formData), [formData]);
  const illustration = useMemo(() => generateIllustrationSuggestion(formData), [formData]);

  const jsonOutput = useMemo(() => {
    return buildCoverPromptJSON(
      formData,
      designStyles[selectedStyleIdx],
      titleOptions[selectedTitleIdx],
      textElements,
      illustration
    );
  }, [formData, selectedStyleIdx, selectedTitleIdx, textElements, illustration, titleOptions]);

  const jsonString = JSON.stringify(jsonOutput, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleText = (key: keyof CoverTextElements) => {
    setTextElements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setStep("options");
    onOpenChange(value);
  };

  const textLabels: { key: keyof CoverTextElements; label: string }[] = [
    { key: "namaSekolah", label: "Nama Sekolah" },
    { key: "kelasFase", label: "Kelas / Fase" },
    { key: "judulKegiatan", label: "Judul Kegiatan" },
    { key: "namaPenyusun", label: "Nama Penyusun" },
    { key: "tahunAjaran", label: "Tahun Ajaran" },
    { key: "jenjang", label: "Jenjang" },
    { key: "tema", label: "Tema" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon size={20} /> Cover Prompt Generator
          </DialogTitle>
          <DialogDescription>
            {step === "options"
              ? "Pilih gaya desain, judul, dan elemen teks untuk cover modul."
              : "Salin JSON prompt berikut untuk digunakan di AI image generator."}
          </DialogDescription>
        </DialogHeader>

        {step === "options" ? (
          <>
            <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-12rem)]">
              <div className="space-y-6 pb-4">
                {/* Design Style */}
                <div>
                  <h3 className="font-bold text-sm mb-2">1. Pilih Gaya Desain</h3>
                  <RadioGroup
                    value={String(selectedStyleIdx)}
                    onValueChange={(v) => setSelectedStyleIdx(Number(v))}
                    className="grid grid-cols-2 gap-2"
                  >
                    {designStyles.map((style, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedStyleIdx === idx
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={String(idx)} className="mt-0.5" />
                        <div>
                          <p className="font-semibold text-xs">{style.style_name}</p>
                          <p className="text-[10px] text-muted-foreground">{style.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Title Options */}
                <div>
                  <h3 className="font-bold text-sm mb-2">2. Pilih Judul Cover</h3>
                  <RadioGroup
                    value={String(selectedTitleIdx)}
                    onValueChange={(v) => setSelectedTitleIdx(Number(v))}
                    className="space-y-2"
                  >
                    {titleOptions.map((title, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTitleIdx === idx
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={String(idx)} />
                        <span className="text-xs">{title}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Illustration */}
                <div>
                  <h3 className="font-bold text-sm mb-2">3. Ilustrasi (otomatis)</h3>
                  <p className="text-xs bg-muted p-3 rounded-lg border">{illustration}</p>
                </div>

                {/* Text Elements */}
                <div>
                  <h3 className="font-bold text-sm mb-2">4. Teks yang Tampil di Cover</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {textLabels.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox
                          checked={textElements[key]}
                          onCheckedChange={() => toggleText(key)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="pt-4 border-t">
              <Button onClick={() => setStep("result")} className="w-full gap-2">
                <Sparkles size={16} />
                Generate Prompt
              </Button>
            </div>
          </>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-12rem)]">
              <pre className="bg-muted text-[10px] p-4 rounded-lg border overflow-x-auto whitespace-pre-wrap">
                {jsonString}
              </pre>
            </ScrollArea>

            <div className="pt-4 border-t flex gap-2">
              <Button variant="outline" onClick={() => setStep("options")} className="gap-1">
                <ArrowLeft size={14} />
                Kembali
              </Button>
              <Button onClick={handleCopy} className="flex-1 gap-1">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Tersalin!" : "Salin JSON Prompt"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
