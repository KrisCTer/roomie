import React, { useMemo, useState } from "react";
import {
  FilePenLine,
  Plus,
  ShieldCheck,
  ScrollText,
  Clock3,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

const AmendmentTermsCard = ({
  contract,
  onAddAmendment,
  onApproveAmendment,
  formatDateTime,
}) => {
  const [amendTitle, setAmendTitle] = useState("");
  const [amendContent, setAmendContent] = useState("");
  const [savingAmendment, setSavingAmendment] = useState(false);
  const [approvingId, setApprovingId] = useState("");

  const bothSigned = Boolean(
    contract?.tenantSigned && contract?.landlordSigned,
  );

  const amendmentList = useMemo(
    () => contract?.amendments || [],
    [contract?.amendments],
  );
  const canCreateAddendum = bothSigned;

  const handleAddAmendment = async () => {
    if (!amendContent.trim()) return;

    setSavingAmendment(true);
    await onAddAmendment({
      title: amendTitle.trim(),
      content: amendContent.trim(),
    });

    setAmendTitle("");
    setAmendContent("");
    setSavingAmendment(false);
  };

  const handleApprove = async (amendmentId) => {
    setApprovingId(amendmentId);
    await onApproveAmendment(amendmentId);
    setApprovingId("");
  };

  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4 flex items-center gap-2">
        <FilePenLine className="w-6 h-6 text-[#CC6F4A]" />
        Sửa đổi, bổ sung và điều khoản phụ
      </h2>

      <div className="mb-4 rounded-xl border border-white/70 bg-white/45 p-3 text-sm text-[#6E675F] flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#CC6F4A]" />
          Trạng thái hợp đồng:
          <strong className="text-[#2B2A28]">
            {bothSigned ? "Đã ký đầy đủ" : "Chưa ký đầy đủ"}
          </strong>
        </span>
        <span className="text-xs text-[#8A837A]">
          {bothSigned
            ? "Điều khoản phụ bị khóa, chỉ thêm phụ lục sau ký"
            : "Có thể chỉnh điều khoản phụ và thêm sửa đổi trước ký"}
        </span>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border border-white/70 bg-white/45 p-4">
          <h3 className="font-semibold text-[#2B2A28] mb-2 flex items-center gap-1.5">
            <ScrollText className="w-4 h-4 text-[#CC6F4A]" />
            Điều khoản phụ
          </h3>
          <p className="text-xs text-[#8A837A] mb-2">
            Điều khoản phụ được chốt một lần khi tạo hợp đồng, không chỉnh sửa
            sau khi đã lưu.
          </p>
          <div className="rounded-xl border border-white/70 bg-white/80 p-3 space-y-2">
            {(contract?.supplementaryTerms || []).length === 0 ? (
              <p className="text-sm text-[#8A837A] italic">
                Chưa có điều khoản phụ.
              </p>
            ) : (
              (contract?.supplementaryTerms || []).map((term, index) => (
                <div
                  key={`${term}-${index}`}
                  className="flex items-start gap-2 text-sm text-[#3C3935]"
                >
                  <CheckCircle2 className="mt-0.5 w-4 h-4 text-[#CC6F4A]" />
                  <span>{term}</span>
                </div>
              ))
            )}
          </div>

          <p className="mt-2 text-xs text-[#8A837A]">
            Điều khoản phụ chỉ nhập một lần khi tạo hợp đồng.
          </p>
        </section>

        <section className="rounded-xl border border-white/70 bg-white/45 p-4">
          <h3 className="font-semibold text-[#2B2A28] mb-2 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#CC6F4A]" />
            Bổ sung / phụ lục hợp đồng
          </h3>

          {!canCreateAddendum && (
            <p className="mb-3 text-xs text-[#8A837A]">
              Phụ lục/sửa đổi chỉ tạo sau khi cả hai bên đã ký hợp đồng đầy đủ.
            </p>
          )}

          <div className="grid gap-2">
            <input
              type="text"
              value={amendTitle}
              onChange={(e) => setAmendTitle(e.target.value)}
              placeholder="Tiêu đề (không bắt buộc)"
              disabled={!canCreateAddendum}
              className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-[#2B2A28] focus:outline-none focus:ring-2 focus:ring-[#CC6F4A]/35 disabled:opacity-60"
            />
            <textarea
              value={amendContent}
              onChange={(e) => setAmendContent(e.target.value)}
              rows={4}
              placeholder={
                canCreateAddendum
                  ? "Nhập nội dung phụ lục sau ký..."
                  : "Chỉ thêm phụ lục sau khi hợp đồng đã ký đầy đủ"
              }
              disabled={!canCreateAddendum}
              className="w-full rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-[#2B2A28] focus:outline-none focus:ring-2 focus:ring-[#CC6F4A]/35 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleAddAmendment}
              disabled={
                !canCreateAddendum || !amendContent.trim() || savingAmendment
              }
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#CC6F4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B55D3D] disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              {savingAmendment ? "Đang thêm..." : "Thêm bổ sung"}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {amendmentList.length === 0 ? (
              <p className="text-sm text-[#8A837A] italic">
                Chưa có nội dung sửa đổi/bổ sung nào.
              </p>
            ) : (
              amendmentList.map((item) => (
                <div
                  key={item.amendmentId || `${item.title}-${item.createdAt}`}
                  className="rounded-xl border border-white/70 bg-white/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#2B2A28]">
                      {item.title || "Bổ sung hợp đồng"}
                    </p>
                    <span className="rounded-full bg-white/80 px-2 py-1 text-xs text-[#6E675F] inline-flex items-center gap-1">
                      {item.approvalStatus === "APPROVED" ? (
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock3 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      {item.approvalStatus === "APPROVED"
                        ? "Đã xác nhận"
                        : "Chờ xác nhận"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#3C3935] whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <p className="mt-2 text-xs text-[#8A837A] inline-flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    {formatDateTime(item.createdAt)}
                  </p>
                  {item.approvalStatus === "PENDING_CONFIRMATION" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(item.amendmentId)}
                        disabled={approvingId === item.amendmentId}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#CC6F4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B55D3D] disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {approvingId === item.amendmentId
                          ? "Đang xác nhận..."
                          : "Xác nhận phụ lục"}
                      </button>
                      <span className="inline-flex items-center rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                        Chờ đủ cả hai bên xác nhận
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AmendmentTermsCard;
