import { useEffect, useMemo, useState } from "react";

const INITIAL_PAGE_SIZE = 5;
const PAGE_SIZE = 5;
const INITIAL_PRIORITY_SIZE = 4;
const PRIORITY_PAGE_SIZE = 4;

const useDashboardPresentation = ({ data, activeRole }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboards");
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [visiblePriorityCount, setVisiblePriorityCount] = useState(
    INITIAL_PRIORITY_SIZE,
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const getEntityPrefix = (entity, keys) => {
    const found = keys
      .map((key) => entity?.[key])
      .find((value) => value !== null && value !== undefined && `${value}`.trim() !== "");
    return found ? String(found).slice(0, 8) : "N/A";
  };

  const normalizeBillStatus = (status) => {
    const upper = (status || "").toUpperCase();
    if (upper === "UNPAID") return "PENDING";
    return upper || "UNKNOWN";
  };

  const isUnpaidLike = (status) => {
    const upper = (status || "").toUpperCase();
    return ["UNPAID", "PENDING", "OVERDUE"].includes(upper);
  };

  const allActivities = useMemo(() => {
    const activities = [];

    if (activeRole === "landlord") {
      data.properties.forEach((property) => {
        activities.push({
          type: "property",
          title: property.title,
          description: `Status: ${property.status || property.propertyStatus}`,
          time: formatTime(property.createdAt),
          createdAt: property.createdAt,
        });
      });

      data.contracts.asLandlord.forEach((contract) => {
        activities.push({
          type: "contract",
          title: `Contract #${contract.contractId?.substring(0, 8)}`,
          description: `Status: ${contract.status}`,
          time: formatTime(contract.createdAt),
          createdAt: contract.createdAt,
        });
      });
    } else {
      data.bookings.forEach((booking) => {
        activities.push({
          type: "booking",
          title: `Booking #${booking.bookingId?.substring(0, 8)}`,
          description: `Status: ${booking.status}`,
          time: formatTime(booking.createdAt),
          createdAt: booking.createdAt,
        });
      });

      data.bills.forEach((bill) => {
        const billPrefix = getEntityPrefix(bill, ["billId", "id"]);
        const billStatus = normalizeBillStatus(bill.status);
        activities.push({
          type: "payment",
          title: `Bill #${billPrefix}`,
          description: `${(bill.totalAmount || 0).toLocaleString()}đ - ${billStatus}`,
          time: formatTime(bill.createdAt),
          createdAt: bill.createdAt,
        });
      });
    }

    return activities.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [data, activeRole]);

  const priorityItems = useMemo(() => {
    if (activeRole === "landlord") {
      const pendingProperties = (data.properties || [])
        .filter((property) =>
          ["DRAFT", "PENDING"].includes(
            (property.status || property.propertyStatus || "").toUpperCase(),
          ),
        )
        .map((property) => ({
          id: property.propertyId || property.id || property.title,
          type: "property",
          title: property.title || "Bất động sản chưa đặt tên",
          subtitle: "Đang chờ duyệt danh sách",
          status: (property.status || property.propertyStatus || "PENDING").toUpperCase(),
          route: "/my-properties?status=pending",
          cta: "Mở danh sách",
          createdAt: property.createdAt,
        }));

      const pendingBookings = (data.bookings || [])
        .filter((booking) => (booking.status || "").toUpperCase() === "PENDING")
        .map((booking) => ({
          id: booking.bookingId || booking.id,
          type: "booking",
          title: `Booking #${(booking.bookingId || booking.id || "").toString().slice(0, 8)}`,
          subtitle: "Yêu cầu thuê đang chờ xác nhận",
          status: "PENDING",
          route: "/my-bookings?status=pending",
          cta: "Xử lý booking",
          createdAt: booking.createdAt,
        }));

      const unpaidBills = (data.bills || [])
        .filter((bill) => isUnpaidLike(bill.status))
        .map((bill) => ({
          id: bill.billId || bill.id,
          type: "payment",
          title: `Hóa đơn ${getEntityPrefix(bill, ["billId", "id"])}`,
          subtitle: `${(bill.totalAmount || 0).toLocaleString()}đ cần theo dõi`,
          status: normalizeBillStatus(bill.status),
          route: "/my-bills?status=unpaid",
          cta: "Xem hóa đơn",
          createdAt: bill.createdAt,
        }));

      return [...pendingBookings, ...unpaidBills, ...pendingProperties].sort(
        (a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        },
      );
    }

    const pendingBookings = (data.bookings || [])
      .filter((booking) => (booking.status || "").toUpperCase() === "PENDING")
      .map((booking) => ({
        id: booking.bookingId || booking.id,
        type: "booking",
        title: `Booking #${(booking.bookingId || booking.id || "").toString().slice(0, 8)}`,
        subtitle: "Đang chờ chủ nhà xác nhận",
        status: "PENDING",
        route: "/my-bookings?status=pending",
        cta: "Theo dõi booking",
        createdAt: booking.createdAt,
      }));

    const pendingContracts = (data.contracts?.asTenant || [])
      .filter((contract) => (contract.status || "").toUpperCase() === "PENDING")
      .map((contract) => ({
        id: contract.contractId || contract.id,
        type: "contract",
        title: `Hợp đồng #${(contract.contractId || contract.id || "").toString().slice(0, 8)}`,
        subtitle: "Chờ ký xác nhận để kích hoạt",
        status: "PENDING",
        route: "/my-contracts",
        cta: "Mở hợp đồng",
        createdAt: contract.createdAt,
      }));

    const unpaidBills = (data.bills || [])
      .filter((bill) => isUnpaidLike(bill.status))
      .map((bill) => ({
        id: bill.billId || bill.id,
        type: "payment",
        title: `Hóa đơn ${getEntityPrefix(bill, ["billId", "id"])}`,
        subtitle: `${(bill.totalAmount || 0).toLocaleString()}đ chưa thanh toán`,
        status: normalizeBillStatus(bill.status),
        route: "/my-bills?status=unpaid",
        cta: "Thanh toán",
        createdAt: bill.createdAt,
      }));

    return [...pendingBookings, ...pendingContracts, ...unpaidBills].sort(
      (a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      },
    );
  }, [activeRole, data]);

  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
    setVisiblePriorityCount(INITIAL_PRIORITY_SIZE);
  }, [activeRole, data]);

  const visibleActivities = useMemo(() => {
    return allActivities.slice(0, visibleCount);
  }, [allActivities, visibleCount]);

  const hasMoreActivities = visibleCount < allActivities.length;
  const visiblePriorityItems = priorityItems.slice(0, visiblePriorityCount);
  const hasMorePriorityItems = visiblePriorityCount < priorityItems.length;

  const loadMoreActivities = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const loadMorePriorityItems = () => {
    setVisiblePriorityCount((prev) => prev + PRIORITY_PAGE_SIZE);
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    activeMenu,
    setActiveMenu,
    visibleActivities,
    hasMoreActivities,
    loadMoreActivities,
    visiblePriorityItems,
    hasMorePriorityItems,
    loadMorePriorityItems,
  };
};

export default useDashboardPresentation;
