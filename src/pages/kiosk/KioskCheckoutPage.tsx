import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { toast } from "sonner";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useCartStore } from "@/store/cart.store";
import { useOrdersStore } from "@/store/orders.store";
import { useCustomersStore } from "@/store/customers.store";
import { useSettingsStore } from "@/store/settings.store";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { inr } from "@/utils/money";
import { createId } from "@/utils/id";

const schema = z.object({
  name: z.string().min(1, "Name required").max(30),
  phone: z.string().regex(/^\d{10}$/, "10-digit phone required"),
  mode: z.enum(["dine_in", "takeaway"]),
  paymentMode: z.enum(["cash", "upi"])
});

type Form = z.infer<typeof schema>;

export function KioskCheckoutPage() {
  const navigate = useNavigate();
  const cart = useCartStore();
  const settings = useSettingsStore((s) => s.settings);
  const createOrder = useOrdersStore((s) => s.createOrder);
  const ingestCustomer = useCustomersStore((s) => s.ingestOrderCustomer);

  const [stage, setStage] = useState<"form" | "cash" | "upi_wait" | "done">("form");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [orderToken, setOrderToken] = useState<number | null>(null);

  const total = cart.total();

  useIdleTimeout(settings.kioskAutoReturnMs, () => navigate("/kiosk", { replace: true }), stage !== "upi_wait");

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", mode: "dine_in", paymentMode: "cash" }
  });

  useEffect(() => {
    if (cart.lines.length === 0) navigate("/kiosk/menu", { replace: true });
  }, [cart.lines.length, navigate]);

  const upiUri = useMemo(() => {
    const pa = encodeURIComponent(settings.upiMerchantVpa);
    const pn = encodeURIComponent(settings.upiMerchantName);
    const am = encodeURIComponent(String(total));
    return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
  }, [settings.upiMerchantVpa, settings.upiMerchantName, total]);

  useEffect(() => {
    if (stage !== "upi_wait") return;
    let mounted = true;
    void (async () => {
      try {
        const url = await QRCode.toDataURL(upiUri, { margin: 1, scale: 7, color: { dark: "#0B0C10", light: "#FFFFFF" } });
        if (mounted) setQrDataUrl(url);
      } catch {
        toast.error("Failed to generate QR.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [stage, upiUri]);

  useEffect(() => {
    if (stage !== "upi_wait") return;
    setSecondsLeft(120);
    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "upi_wait") return;
    if (secondsLeft <= 0) {
      toast.message("Payment window expired. Please try again.");
      setStage("form");
    }
  }, [secondsLeft, stage]);

  function submit(values: Form) {
    const clientRequestId = createId("req");
    const res = createOrder({
      channel: "kiosk",
      paymentMode: values.paymentMode,
      mode: values.mode,
      customerName: values.name,
      customerPhone: values.phone,
      items: cart.lines.map((l) => ({
        itemId: l.itemId,
        name: l.name,
        type: l.type,
        qty: l.qty,
        unitPrice: l.unitPrice,
        notes: l.notes,
        taxPercent: l.taxPercent
      })),
      clientRequestId
    });
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    ingestCustomer(res.order);
    setOrderToken(res.order.token);
    cart.clear();
    if (values.paymentMode === "cash") setStage("cash");
    if (values.paymentMode === "upi") setStage("upi_wait");
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-zinc-50">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/kiosk/menu")}
            className="grid size-11 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/7"
          >
            ←
          </button>
          <div className="flex-1">
            <div className="text-lg font-semibold tracking-tight">Checkout</div>
            <div className="mt-1 text-sm text-zinc-400">Confirm details and place order.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-2 text-sm">
            Total: <span className="font-semibold">{inr(total)}</span>
          </div>
        </div>

        {stage === "form" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-zinc-100">Customer</div>
                <div className="mt-1 text-[12px] text-zinc-400">We use this for order updates & CRM.</div>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={form.handleSubmit(submit)}>
                  <div>
                    <div className="mb-2 text-[12px] font-semibold text-zinc-300">Name</div>
                    <Input placeholder="e.g. Lakshya" {...form.register("name")} />
                    {form.formState.errors.name ? (
                      <div className="mt-1 text-[12px] text-rose-300">{form.formState.errors.name.message}</div>
                    ) : null}
                  </div>
                  <div>
                    <div className="mb-2 text-[12px] font-semibold text-zinc-300">Phone</div>
                    <Input inputMode="numeric" placeholder="10-digit number" {...form.register("phone")} />
                    {form.formState.errors.phone ? (
                      <div className="mt-1 text-[12px] text-rose-300">{form.formState.errors.phone.message}</div>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 text-[12px] font-semibold text-zinc-300">Order type</div>
                      <Select {...form.register("mode")}>
                        <option value="dine_in">Dine In</option>
                        <option value="takeaway">Takeaway</option>
                      </Select>
                    </div>
                    <div>
                      <div className="mb-2 text-[12px] font-semibold text-zinc-300">Payment</div>
                      <Select {...form.register("paymentMode")}>
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                      </Select>
                    </div>
                  </div>

                  <Button variant="primary" size="xl" className="mt-2 w-full" type="submit">
                    Place Order
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-zinc-100">Summary</div>
                <div className="mt-1 text-[12px] text-zinc-400">{cart.lines.length} items</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cart.lines.map((l) => (
                    <div key={l.itemId} className="flex items-start justify-between rounded-2xl border border-white/8 bg-white/3 px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{l.name}</div>
                        <div className="mt-1 text-[12px] text-zinc-400">
                          {l.qty} × {inr(l.unitPrice)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">{inr(l.unitPrice * l.qty)}</div>
                    </div>
                  ))}
                  <div className="mt-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Subtotal</span>
                      <span className="font-semibold">{inr(cart.subtotal())}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-zinc-300">
                      <span>Tax</span>
                      <span className="font-semibold">{inr(cart.tax())}</span>
                    </div>
                    <div className="mt-3 h-px bg-white/8" />
                    <div className="mt-3 flex items-center justify-between text-zinc-50">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-semibold tracking-tight">{inr(total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {stage === "cash" ? (
          <div className="mt-6">
            <Card className="overflow-hidden">
              <div className="border-b border-white/8 bg-white/3 px-6 py-5">
                <div className="text-lg font-semibold tracking-tight">Please pay at counter</div>
                <div className="mt-1 text-sm text-zinc-400">Your order has been placed successfully.</div>
              </div>
              <div className="px-6 py-6">
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-6">
                  <div className="text-sm text-zinc-300">Token</div>
                  <div className="mt-2 text-5xl font-semibold tracking-tight">{orderToken ?? "—"}</div>
                  <div className="mt-3 text-sm text-zinc-400">
                    Show this token at the counter to complete payment.
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="primary" size="xl" onClick={() => navigate("/kiosk", { replace: true })}>
                    Done
                  </Button>
                  <Button variant="secondary" size="xl" onClick={() => navigate("/kiosk/menu", { replace: true })}>
                    New order
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : null}

        {stage === "upi_wait" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-zinc-100">Pay via UPI</div>
                <div className="mt-1 text-[12px] text-zinc-400">Scan QR in any UPI app.</div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2.5xl border border-white/10 bg-white/4 p-5">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="UPI QR" className="mx-auto w-[280px] rounded-2xl bg-white p-3" />
                  ) : (
                    <div className="mx-auto grid h-[320px] w-[280px] place-items-center rounded-2xl bg-white/6 text-sm text-zinc-300">
                      Generating QR…
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-zinc-400">Amount</div>
                    <div className="font-semibold text-zinc-50">{inr(total)}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="text-zinc-400">Time left</div>
                    <div className="font-semibold text-zinc-50">{secondsLeft}s</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="primary" size="lg" className="flex-1" onClick={() => setStage("done")}>
                    I’ve paid
                  </Button>
                  <Button variant="secondary" size="lg" onClick={() => setStage("form")}>
                    Back
                  </Button>
                </div>
                <div className="mt-3 text-[12px] text-zinc-500">
                  In production, verify payment via your PSP/webhook before confirming.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-zinc-100">Token</div>
                <div className="mt-1 text-[12px] text-zinc-400">Keep this visible until payment is confirmed.</div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-6">
                  <div className="text-sm text-zinc-300">Token number</div>
                  <div className="mt-2 text-5xl font-semibold tracking-tight">{orderToken ?? "—"}</div>
                </div>
                <div className="mt-4 rounded-2.5xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-400">
                  If you paid but the screen times out, show your token at the counter.
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {stage === "done" ? (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="text-lg font-semibold tracking-tight">Order placed</div>
                <div className="mt-1 text-sm text-zinc-400">Thank you. Your order is in the queue.</div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2.5xl border border-white/8 bg-white/3 p-6">
                  <div className="text-sm text-zinc-300">Token</div>
                  <div className="mt-2 text-5xl font-semibold tracking-tight">{orderToken ?? "—"}</div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="primary" size="xl" onClick={() => navigate("/kiosk", { replace: true })}>
                    Done
                  </Button>
                  <Button variant="secondary" size="xl" onClick={() => navigate("/kiosk/menu", { replace: true })}>
                    New order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

