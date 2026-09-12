"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { CopyButton } from "../shared/copy-button";
import { Download, QrCode as QrIcon, Sliders } from "lucide-react";
import { getShortUrl } from "@/lib/utils";

interface QrCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortCode: string;
  destinationUrl?: string;
}

export function QrCodeModal({
  open,
  onOpenChange,
  shortCode,
  destinationUrl,
}: QrCodeModalProps) {
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [svgString, setSvgString] = React.useState<string>("");
  const [darkColor, setDarkColor] = React.useState<string>("#0f172a");
  const [lightColor, setLightColor] = React.useState<string>("#ffffff");
  const [size, setSize] = React.useState<number>(512);
  const [showOptions, setShowOptions] = React.useState<boolean>(false);

  const fullUrl = getShortUrl(shortCode);

  React.useEffect(() => {
    if (!open || !shortCode) return;

    // Generate PNG Data URL
    QRCode.toDataURL(fullUrl, {
      width: size,
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));

    // Generate SVG string
    QRCode.toString(fullUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: "H",
    })
      .then((svg) => setSvgString(svg))
      .catch((err) => console.error("QR SVG generation error:", err));
  }, [open, shortCode, fullUrl, darkColor, lightColor, size]);

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `zaplink-${shortCode}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zaplink-${shortCode}-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const presetColors = [
    { name: "Default Navy", dark: "#0f172a", light: "#ffffff" },
    { name: "Electric Indigo", dark: "#4f46e5", light: "#ffffff" },
    { name: "Cyan Teal", dark: "#0891b2", light: "#ffffff" },
    { name: "Emerald", dark: "#059669", light: "#ffffff" },
    { name: "Dark Velvet", dark: "#1e1b4b", light: "#e0e7ff" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <QrIcon className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>QR Code Generator</DialogTitle>
            <DialogDescription className="mt-0.5">
              Scan or download high-resolution QR for your short link
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="flex flex-col items-center gap-4 py-1 w-full">
        {/* Crisp Centered QR Code Card */}
        <div className="flex items-center justify-center rounded-2xl border border-border bg-white p-3 shadow-lg shadow-black/20 w-48 h-48 mx-auto shrink-0">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR Code for ${fullUrl}`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              Generating QR...
            </div>
          )}
        </div>

        {/* Short Link display with 1-Click Copy */}
        <div className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2">
          <div className="overflow-hidden mr-2">
            <p className="text-[10px] text-muted-foreground">Short Link</p>
            <p className="truncate font-mono text-xs font-bold text-foreground">
              {fullUrl}
            </p>
          </div>
          <CopyButton text={fullUrl} size="sm" variant="ghost" />
        </div>

        {/* Customization Toggle */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Sliders className="h-3 w-3" />
            <span>{showOptions ? "Hide customization" : "Customize colors & size"}</span>
          </button>

          {showOptions && (
            <div className="mt-2.5 space-y-3 rounded-xl border border-border bg-muted/30 p-3 text-xs animate-fade-in">
              <div>
                <label className="text-muted-foreground font-medium mb-1 block text-[11px]">
                  Color Themes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetColors.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setDarkColor(preset.dark);
                        setLightColor(preset.light);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 transition-all hover:border-primary text-[11px]"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full border"
                        style={{ backgroundColor: preset.dark }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground font-medium mb-1 block text-[11px]">
                  Resolution
                </label>
                <div className="flex gap-2">
                  {[256, 512, 1024].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex-1 rounded-lg border py-1 font-medium text-[11px] transition-all ${
                        size === s
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download Buttons - Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 w-full pt-1">
          <Button
            variant="default"
            size="sm"
            onClick={downloadPng}
            className="w-full gap-1.5 text-xs font-semibold h-10"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PNG</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadSvg}
            className="w-full gap-1.5 text-xs font-semibold h-10"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download SVG</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
