import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  QrCode,
  CreditCard,
  Copy,
  Check,
  ArrowLeft,
  MessageCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  balanceAmount: number;
}

type PaymentMethod = "banco" | "yape" | "tarjeta" | null;

const VIBRA_WHATSAPP_NUMBER = "51970608367";

export function PaymentOnboardingModal({
  isOpen,
  onClose,
  balanceAmount,
}: PaymentOnboardingModalProps) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copiado al portapapeles`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getWhatsAppUrl = () => {
    const methodText =
      method === "banco"
        ? "Transferencia Bancaria"
        : method === "yape"
        ? "Yape"
        : "Tarjeta de Débito/Crédito";

    const text = encodeURIComponent(
      `Hola Vibra Music! 👋 Adjunto el comprobante de mi pago de S/ ${balanceAmount.toFixed(
        2,
      )} realizado mediante ${methodText}.`,
    );
    return `https://wa.me/${VIBRA_WHATSAPP_NUMBER}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            {method && (
              <button
                onClick={() => setMethod(null)}
                className="rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h3 className="font-semibold text-foreground text-base">
              {method === null ? "Selecciona Método de Pago" : "Instrucciones de Pago"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {method === null ? (
              /* PASO 1: Selección de Método */
              <motion.div
                key="step-select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                <p className="text-xs text-muted-foreground mb-4">
                  Monto pendiente a regularizar:{" "}
                  <strong className="text-foreground text-sm font-bold">
                    S/ {balanceAmount.toFixed(2)}
                  </strong>
                </p>

                {/* Opción 1: Cuenta Bancaria */}
                <button
                  onClick={() => setMethod("banco")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        1. Cuenta Bancaria
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Transferencia BCP / Interbank
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    Elegir →
                  </span>
                </button>

                {/* Opción 2: Yape */}
                <button
                  onClick={() => setMethod("yape")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">2. Yape</p>
                      <p className="text-xs text-muted-foreground">
                        Pago directo por número / QR
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    Elegir →
                  </span>
                </button>

                {/* Opción 3: Tarjeta */}
                <button
                  onClick={() => setMethod("tarjeta")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        3. Tarjeta Débito / Crédito
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pago seguro online (Visa, Mastercard)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                    Elegir →
                  </span>
                </button>
              </motion.div>
            ) : (
              /* PASO 2: Datos e instrucciones + Enviar a WhatsApp */
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Opción 1: Datos Bancarios */}
                {method === "banco" && (
                  <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                      Cuentas Vibra Music S.A.C.
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                        <div>
                          <p className="text-[11px] text-muted-foreground">BCP Soles</p>
                          <p className="font-mono text-xs font-bold text-foreground">
                            191-98765432-0-11
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            CCI: 00219100987654320114
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy("191-98765432-0-11", "Cuenta BCP")}
                        >
                          {copiedField === "Cuenta BCP" ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between bg-card p-2.5 rounded-lg border border-border">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Interbank Soles</p>
                          <p className="font-mono text-xs font-bold text-foreground">
                            200-3001234567
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy("200-3001234567", "Cuenta Interbank")}
                        >
                          {copiedField === "Cuenta Interbank" ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Opción 2: Yape */}
                {method === "yape" && (
                  <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-center">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                      Yapear a Vibra Music
                    </p>
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl">
                      <p className="text-2xl font-bold font-mono text-primary">
                        970 608 367
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Titular: Escuela de Música Vibra Music
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCopy("970608367", "Número Yape")}
                    >
                      {copiedField === "Número Yape" ? (
                        <Check className="h-4 w-4 text-success mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copiar número Yape
                    </Button>
                  </div>
                )}

                {/* Opción 3: Tarjeta */}
                {method === "tarjeta" && (
                  <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                      Pago Online con Tarjeta
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el botón de abajo para ser redirigido a la pasarela de pago seguro o solicitar tu enlace de pago personalizado por WhatsApp.
                    </p>
                  </div>
                )}

                {/* BOTÓN FINAL OBLIGATORIO: Enviar comprobante por WhatsApp */}
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-[11px] text-center text-muted-foreground">
                    Paso final: Envíanos la captura o voucher para validar tu pago.
                  </p>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-bold text-success-foreground transition-all hover:bg-success/90 shadow-md"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" />
                    Enviar a Vibra Music por WhatsApp
                    <ExternalLink className="h-4 w-4 ml-1 opacity-70" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
