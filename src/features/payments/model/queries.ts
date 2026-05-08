import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { paymentsService } from "@/entities/payments";
import type { PaymentListParams } from "@/shared/types/payments";

export const paymentKeys = {
  all: ["payments"] as const,
  list: (params?: PaymentListParams) => [...paymentKeys.all, "list", params] as const,
  summary: () => [...paymentKeys.all, "summary"] as const,
  settlements: () => [...paymentKeys.all, "settlements"] as const,
  settlementSummary: () => [...paymentKeys.all, "settlement-summary"] as const,
};

export function usePayments(params?: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsService.getAll(params).then((res) => res.data),
  });
}

export function usePaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: () => paymentsService.getSummary().then((res) => res.data),
  });
}

export function useUploadReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, file }: { paymentId: number; file: File }) =>
      paymentsService.uploadReceipt(paymentId, file).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Чек загружен, выплата подтверждена");
    },
    onError: () => {
      toast.error("Ошибка загрузки чека");
    },
  });
}

// ---------- Settlements ----------

export function useSettlements() {
  return useQuery({
    queryKey: paymentKeys.settlements(),
    queryFn: () => paymentsService.getSettlements().then((res) => res.data),
  });
}

export function useSettlementSummary() {
  return useQuery({
    queryKey: paymentKeys.settlementSummary(),
    queryFn: () => paymentsService.getSettlementSummary().then((res) => res.data),
  });
}

export function useMarkPaidToBroker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, file }: { settlementId: number; file: File }) =>
      paymentsService.markPaidToBroker(settlementId, file).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Выплата брокеру зафиксирована");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail ?? "Ошибка");
    },
  });
}

export function useUploadDeveloperReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, file }: { settlementId: number; file: File }) =>
      paymentsService
        .uploadDeveloperReceipt(settlementId, file)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Чек загружен, ожидает подтверждения админом");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail ?? "Ошибка");
    },
  });
}

export function useConfirmDeveloperReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: number) =>
      paymentsService.confirmDeveloperReceipt(settlementId).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Поступление от девелопера подтверждено");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail ?? "Ошибка");
    },
  });
}

export function useRejectDeveloperReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, reason }: { settlementId: number; reason: string }) =>
      paymentsService
        .rejectDeveloperReceipt(settlementId, reason)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.all });
      toast.success("Чек отклонён, девелопер уведомлён");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { detail?: string; reason?: string[] } } };
      const data = e.response?.data;
      toast.error(
        (Array.isArray(data?.reason) ? data?.reason[0] : data?.detail) ??
          "Не удалось отклонить чек",
      );
    },
  });
}
