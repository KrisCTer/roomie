/* aria-label */
import React from "react";
import { PenTool, CheckCircle, Clock, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionsCard = ({
  contract,
  canSign,
  isSigned,
  otherPartySigned,
  party,
  pdfUrl,
  onSignClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="home-glass-card rounded-2xl p-6 border border-white/55">
      <h2 className="text-xl font-bold text-[#2B2A28] mb-4">Hành động</h2>

      <div className="space-y-3">
        {/* Show sign button if user can sign */}
        {canSign && party && (
          <button
            onClick={onSignClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#CC6F4A] text-white rounded-xl hover:bg-[#B55D3D] transition-all font-semibold shadow-[0_8px_18px_rgba(204,111,74,0.3)]"
          >
            <PenTool className="w-5 h-5" />
            Ký hợp đồng ngay
          </button>
        )}

        {/* Show if user already signed */}
        {isSigned && (
          <div className="p-3 bg-emerald-500/12 border border-emerald-500/35 rounded-xl">
            <p className="text-sm text-emerald-700 font-medium text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bạn đã ký hợp đồng này
            </p>
          </div>
        )}

        {/* Show waiting message */}
        {isSigned && !otherPartySigned && (
          <div className="p-3 bg-amber-500/12 border border-amber-500/35 rounded-xl">
            <p className="text-sm text-amber-700 text-center flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Đang chờ {party === "landlord" ? "người thuê" : "chủ nhà"} ký hợp
              đồng
            </p>
          </div>
        )}

        {/* Show if user is not a party */}
        {!party && (
          <div className="p-3 bg-rose-500/12 border border-rose-500/35 rounded-xl">
            <p className="text-sm text-rose-700 text-center">
              Bạn không phải là một bên tham gia vào hợp đồng này.
            </p>
          </div>
        )}

        {/* Download contract */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/70 text-[#3C3935] rounded-xl border border-white/70 hover:bg-white/85 transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Tải xuống hợp đồng
          </a>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate("/my-contracts")}
          className="w-full px-4 py-3 bg-white/45 border border-white/70 text-[#3C3935] rounded-xl hover:bg-white/65 transition-colors font-medium"
        >
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
};

export default ActionsCard;
