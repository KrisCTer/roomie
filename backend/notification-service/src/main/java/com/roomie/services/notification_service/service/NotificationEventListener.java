package com.roomie.services.notification_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.roomie.services.notification_service.dto.event.*;
import com.roomie.services.notification_service.dto.request.CreateNotificationRequest;
import com.roomie.services.notification_service.enums.NotificationChannel;
import com.roomie.services.notification_service.enums.NotificationPriority;
import com.roomie.services.notification_service.enums.NotificationType;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationEventListener {

    NotificationService notificationService;
    ObjectMapper objectMapper;

    // ==================== BOOKING EVENTS ====================

    @KafkaListener(topics = "booking.created", groupId = "notification-service")
    public void onBookingCreated(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.created event: {}", event.getBookingId());

            // Notify landlord
            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getLandlordId())
                    .type(NotificationType.BOOKING_CREATED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Yêu cầu đặt phòng mới")
                    .message(String.format("%s muốn đặt phòng '%s'",
                            event.getTenantName(), event.getPropertyTitle()))
                    .shortMessage("Bạn có yêu cầu đặt phòng mới")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .metadata(Map.of(
                            "tenantName", event.getTenantName(),
                            "propertyTitle", event.getPropertyTitle(),
                            "checkInDate", event.getCheckInDate().toString()
                    ))
                    .build());

            // Notify tenant (confirmation)
            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.BOOKING_CREATED)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.IN_APP)
                    .title("Yêu cầu đặt phòng đã được gửi")
                    .message(String.format("Yêu cầu đặt phòng '%s' đang chờ chủ nhà xác nhận",
                            event.getPropertyTitle()))
                    .shortMessage("Yêu cầu đặt phòng đã gửi")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.created event", e);
        }
    }

    @KafkaListener(topics = "booking.confirmed", groupId = "notification-service")
    public void onBookingConfirmed(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.confirmed event: {}", event.getBookingId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.BOOKING_CONFIRMED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Đặt phòng được xác nhận!")
                    .message(String.format("Chủ nhà đã xác nhận yêu cầu đặt phòng '%s'. Vui lòng hoàn tất thanh toán để bắt đầu hợp đồng.",
                            event.getPropertyTitle()))
                    .shortMessage("Đặt phòng đã được chấp nhận")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId() + "/payment")
                    .actionText("Thanh toán ngay")
                    .metadata(Map.of(
                            "propertyTitle", event.getPropertyTitle(),
                            "totalPrice", event.getTotalPrice().toString()
                    ))
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.confirmed event", e);
        }
    }

    @KafkaListener(topics = "booking.cancelled", groupId = "notification-service")
    public void onBookingCancelled(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.cancelled event: {}", event.getBookingId());

            // Notify the other party
            String recipientId = event.getStatus().contains("TENANT") ?
                    event.getLandlordId() : event.getTenantId();
            String recipientName = event.getStatus().contains("TENANT") ?
                    event.getTenantName() : event.getLandlordName();

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(recipientId)
                    .type(NotificationType.BOOKING_CANCELLED)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.ALL)
                    .title("Đặt phòng đã bị hủy")
                    .message(String.format("%s đã hủy đặt phòng '%s'",
                            recipientName, event.getPropertyTitle()))
                    .shortMessage("Một đặt phòng đã bị hủy")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.cancelled event", e);
        }
    }

    @KafkaListener(topics = "booking.rejected", groupId = "notification-service")
    public void onBookingRejected(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.rejected event: {}", event.getBookingId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.BOOKING_REJECTED)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.ALL)
                    .title("Yêu cầu đặt phòng bị từ chối")
                    .message(String.format("Chủ nhà đã từ chối yêu cầu đặt phòng '%s'. Bạn có thể tìm các phòng khác phù hợp.",
                            event.getPropertyTitle()))
                    .shortMessage("Đặt phòng bị từ chối")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/properties/search")
                    .actionText("Tìm phòng khác")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.rejected event", e);
        }
    }

    @KafkaListener(topics = "booking.terminated", groupId = "notification-service")
    public void onBookingTerminated(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.terminated event: {}", event.getBookingId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.BOOKING_TERMINATED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Hợp đồng đã chấm dứt")
                    .message(String.format("Hợp đồng thuê '%s' đã được chấm dứt",
                            event.getPropertyTitle()))
                    .shortMessage("Hợp đồng chấm dứt")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getLandlordId())
                    .type(NotificationType.BOOKING_TERMINATED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Hợp đồng đã chấm dứt")
                    .message(String.format("Hợp đồng thuê '%s' đã được chấm dứt",
                            event.getPropertyTitle()))
                    .shortMessage("Hợp đồng chấm dứt")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.terminated event", e);
        }
    }

    @KafkaListener(topics = "booking.expired", groupId = "notification-service")
    public void onBookingExpired(String message, Acknowledgment ack) {
        try {
            BookingEvent event = parseEvent(message, BookingEvent.class);
            log.info("Processing booking.expired event: {}", event.getBookingId());

            // Notify both parties
            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.BOOKING_EXPIRED)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.ALL)
                    .title("Hợp đồng đã hết hạn")
                    .message(String.format("Hợp đồng thuê '%s' đã hết hạn",
                            event.getPropertyTitle()))
                    .shortMessage("Hợp đồng hết hạn")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getLandlordId())
                    .type(NotificationType.BOOKING_EXPIRED)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.ALL)
                    .title("Hợp đồng đã hết hạn")
                    .message(String.format("Hợp đồng thuê '%s' đã hết hạn",
                            event.getPropertyTitle()))
                    .shortMessage("Hợp đồng hết hạn")
                    .relatedEntityId(event.getBookingId())
                    .relatedEntityType("BOOKING")
                    .actionUrl("/bookings/" + event.getBookingId())
                    .actionText("Xem chi tiết")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process booking.expired event", e);
        }
    }

    // ==================== CONTRACT EVENTS ====================

    @KafkaListener(topics = "contract.created", groupId = "notification-service")
    public void onContractCreated(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.created event: {}", event.getContractId());

            // Notify both tenant and landlord
            String[] userIds = {event.getTenantId(), event.getLandlordId()};

            for (String userId : userIds) {
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .userId(userId)
                        .type(NotificationType.CONTRACT_CREATED)
                        .priority(NotificationPriority.HIGH)
                        .channel(NotificationChannel.ALL)
                        .title("Hợp đồng mới đã được tạo")
                        .message(String.format("Hợp đồng thuê nhà '%s' đã sẵn sàng để ký",
                                event.getPropertyTitle()))
                        .shortMessage("Hợp đồng mới cần ký")
                        .relatedEntityId(event.getContractId())
                        .relatedEntityType("CONTRACT")
                        .actionUrl("/contract-signing/" + event.getContractId())
                        .actionText("Xem và ký")
                        .build());
            }

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.created event", e);
        }
    }

    @KafkaListener(topics = "contract.signed", groupId = "notification-service")
    public void onContractSigned(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.signed event: {}", event.getContractId());

            if ("TENANT".equals(event.getSignedBy())) {
                // Notify landlord
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .userId(event.getLandlordId())
                        .type(NotificationType.CONTRACT_SIGNED_BY_TENANT)
                        .priority(NotificationPriority.HIGH)
                        .channel(NotificationChannel.ALL)
                        .title("Người thuê đã ký hợp đồng")
                        .message(String.format("%s đã ký hợp đồng thuê '%s'. Hợp đồng đang chờ bạn ký.",
                                event.getTenantName(), event.getPropertyTitle()))
                        .shortMessage("Người thuê đã ký hợp đồng")
                        .relatedEntityId(event.getContractId())
                        .relatedEntityType("CONTRACT")
                        .actionUrl("/contracts/" + event.getContractId() + "/sign")
                        .actionText("Ký ngay")
                        .build());
            } else if ("LANDLORD".equals(event.getSignedBy())) {
                // Notify tenant
                notificationService.createNotification(CreateNotificationRequest.builder()
                        .userId(event.getTenantId())
                        .type(NotificationType.CONTRACT_SIGNED_BY_LANDLORD)
                        .priority(NotificationPriority.HIGH)
                        .channel(NotificationChannel.ALL)
                        .title("Chủ nhà đã ký hợp đồng")
                        .message(String.format("Chủ nhà đã ký hợp đồng thuê '%s'. Hợp đồng đang chờ bạn ký.",
                                event.getPropertyTitle()))
                        .shortMessage("Chủ nhà đã ký hợp đồng")
                        .relatedEntityId(event.getContractId())
                        .relatedEntityType("CONTRACT")
                        .actionUrl("/contracts/" + event.getContractId() + "/sign")
                        .actionText("Ký ngay")
                        .build());
            }

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.signed event", e);
        }
    }

    @KafkaListener(topics = "contract.pending_payment", groupId = "notification-service")
    public void onContractPendingPayment(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.pending_payment event: {}", event.getContractId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getTenantId())
                    .type(NotificationType.CONTRACT_PENDING_PAYMENT)
                    .priority(NotificationPriority.URGENT)
                    .channel(NotificationChannel.ALL)
                    .title("Cần thanh toán để kích hoạt hợp đồng")
                    .message(String.format("Cả hai bên đã ký hợp đồng. Vui lòng thanh toán %s VNĐ để kích hoạt hợp đồng.",
                            event.getRentalDeposit()))
                    .shortMessage("Cần thanh toán")
                    .relatedEntityId(event.getContractId())
                    .relatedEntityType("CONTRACT")
                    .actionUrl("/contracts/" + event.getContractId() + "/payment")
                    .actionText("Thanh toán ngay")
                    .metadata(Map.of(
                            "amount", event.getRentalDeposit().toString(),
                            "contractId", event.getContractId()
                    ))
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.pending_payment event", e);
        }
    }

    @KafkaListener(topics = "contract.activated", groupId = "notification-service")
    public void onContractActivated(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.activated event: {}", event.getContractId());

            // Notify both parties
            notifyBothParties(
                    event,
                    NotificationType.CONTRACT_ACTIVATED,
                    "Hợp đồng đã được kích hoạt! 🎉",
                    String.format("Hợp đồng thuê '%s' đã chính thức có hiệu lực từ ngày %s",
                            event.getPropertyTitle(), event.getStartDate()),
                    "Hợp đồng đã kích hoạt",
                    NotificationPriority.HIGH,
                    NotificationChannel.ALL
            );

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.activated event", e);
        }
    }

    @KafkaListener(topics = "contract.terminated", groupId = "notification-service")
    public void onContractTerminated(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.terminated event: {}", event.getContractId());

            notifyBothParties(
                    event,
                    NotificationType.CONTRACT_TERMINATED,
                    "Hợp đồng đã chấm dứt",
                    String.format("Hợp đồng thuê '%s' đã được chấm dứt",
                            event.getPropertyTitle()),
                    "Hợp đồng chấm dứt",
                    NotificationPriority.HIGH,
                    NotificationChannel.ALL
            );

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.terminated event", e);
        }
    }

    @KafkaListener(topics = "contract.expired", groupId = "notification-service")
    public void onContractExpired(String message, Acknowledgment ack) {
        try {
            ContractEvent event = parseEvent(message, ContractEvent.class);
            log.info("Processing contract.expired event: {}", event.getContractId());

            notifyBothParties(
                    event,
                    NotificationType.CONTRACT_EXPIRED,
                    "Hợp đồng đã hết hạn",
                    String.format("Hợp đồng thuê '%s' đã hết hạn vào ngày %s",
                            event.getPropertyTitle(), event.getEndDate()),
                    "Hợp đồng hết hạn",
                    NotificationPriority.HIGH,
                    NotificationChannel.ALL
            );

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process contract.expired event", e);
        }
    }

    // ==================== PAYMENT EVENTS ====================

    @KafkaListener(topics = "payment.completed", groupId = "notification-service")
    public void onPaymentCompleted(String message, Acknowledgment ack) {
        try {
            PaymentEvent event = parseEvent(message, PaymentEvent.class);
            log.info("Processing payment.completed event: {}", event.getPaymentId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getUserId())
                    .type(NotificationType.PAYMENT_COMPLETED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Thanh toán thành công!")
                    .message(String.format("Giao dịch %s VNĐ đã được xử lý thành công. %s",
                            event.getAmount(), event.getDescription()))
                    .shortMessage("Thanh toán thành công")
                    .relatedEntityId(event.getPaymentId())
                    .relatedEntityType("PAYMENT")
                    .actionUrl("/payments/" + event.getPaymentId())
                    .actionText("Xem chi tiết")
                    .metadata(Map.of(
                            "amount", event.getAmount().toString(),
                            "paymentMethod", event.getPaymentMethod(),
                            "paidAt", event.getPaidAt().toString()
                    ))
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process payment.completed event", e);
        }
    }

    @KafkaListener(topics = "payment.failed", groupId = "notification-service")
    public void onPaymentFailed(String message, Acknowledgment ack) {
        try {
            PaymentEvent event = parseEvent(message, PaymentEvent.class);
            log.info("Processing payment.failed event: {}", event.getPaymentId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getUserId())
                    .type(NotificationType.PAYMENT_FAILED)
                    .priority(NotificationPriority.URGENT)
                    .channel(NotificationChannel.ALL)
                    .title("Thanh toán thất bại ❌")
                    .message(String.format("Giao dịch %s VNĐ không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.",
                            event.getAmount()))
                    .shortMessage("Thanh toán thất bại")
                    .relatedEntityId(event.getPaymentId())
                    .relatedEntityType("PAYMENT")
                    .actionUrl("/payments/" + event.getPaymentId() + "/retry")
                    .actionText("Thử lại")
                    .metadata(Map.of(
                            "amount", event.getAmount().toString(),
                            "reason", event.getStatus()
                    ))
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process payment.failed event", e);
        }
    }

    // ==================== PROPERTY EVENTS ====================

    @KafkaListener(topics = "property.approved", groupId = "notification-service")
    public void onPropertyApproved(String message, Acknowledgment ack) {
        try {
            PropertyEvent event = parseEvent(message, PropertyEvent.class);
            log.info("Processing property.approved event: {}", event.getPropertyId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getOwnerId())
                    .type(NotificationType.PROPERTY_APPROVED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Tin đăng được duyệt! 🎉")
                    .message(String.format("Tin đăng '%s' đã được phê duyệt và hiển thị công khai",
                            event.getTitle()))
                    .shortMessage("Tin đăng đã được duyệt")
                    .relatedEntityId(event.getPropertyId())
                    .relatedEntityType("PROPERTY")
                    .actionUrl("/properties/" + event.getPropertyId())
                    .actionText("Xem tin đăng")
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process property.approved event", e);
        }
    }

    @KafkaListener(topics = "property.rejected", groupId = "notification-service")
    public void onPropertyRejected(String message, Acknowledgment ack) {
        try {
            PropertyEvent event = parseEvent(message, PropertyEvent.class);
            log.info("Processing property.rejected event: {}", event.getPropertyId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getOwnerId())
                    .type(NotificationType.PROPERTY_REJECTED)
                    .priority(NotificationPriority.HIGH)
                    .channel(NotificationChannel.ALL)
                    .title("Tin đăng bị từ chối")
                    .message(String.format("Tin đăng '%s' không được phê duyệt. Lý do: %s",
                            event.getTitle(),
                            event.getRejectionReason() != null ? event.getRejectionReason() : "Không đáp ứng tiêu chuẩn"))
                    .shortMessage("Tin đăng bị từ chối")
                    .relatedEntityId(event.getPropertyId())
                    .relatedEntityType("PROPERTY")
                    .actionUrl("/properties/" + event.getPropertyId() + "/edit")
                    .actionText("Chỉnh sửa")
                    .metadata(Map.of(
                            "rejectionReason", event.getRejectionReason() != null ? event.getRejectionReason() : ""
                    ))
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process property.rejected event", e);
        }
    }

    // ==================== MESSAGE EVENTS ====================

    @KafkaListener(topics = "message.new", groupId = "notification-service")
    public void onNewMessage(String message, Acknowledgment ack) {
        try {
            MessageEvent event = parseEvent(message, MessageEvent.class);
            log.info("Processing message.new event: {}", event.getMessageId());

            notificationService.createNotification(CreateNotificationRequest.builder()
                    .userId(event.getReceiverId())
                    .type(NotificationType.NEW_MESSAGE)
                    .priority(NotificationPriority.NORMAL)
                    .channel(NotificationChannel.IN_APP)
                    .title("Tin nhắn mới từ " + event.getSenderName())
                    .message(event.getContent().length() > 100 ?
                            event.getContent().substring(0, 100) + "..." :
                            event.getContent())
                    .shortMessage("Bạn có tin nhắn mới")
                    .relatedEntityId(event.getConversationId())
                    .relatedEntityType("MESSAGE")
                    .actionUrl("/messages/" + event.getConversationId())
                    .actionText("Xem tin nhắn")
                    .metadata(Map.of(
                            "senderId", event.getSenderId(),
                            "senderName", event.getSenderName(),
                            "messageType", event.getMessageType()
                    ))
                    .expiryDays(7) // Messages expire after 7 days
                    .build());

            ack.acknowledge();
        } catch (Exception e) {
            log.error("Failed to process message.new event", e);
        }
    }

    // ==================== HELPER METHODS ====================

    private <T> T parseEvent(String message, Class<T> clazz) throws Exception {
        return objectMapper.readValue(message, clazz);
    }

    private void notifyBothParties(
            ContractEvent event,
            NotificationType type,
            String title,
            String message,
            String shortMessage,
            NotificationPriority priority,
            NotificationChannel channel
    ) {
        // Notify landlord
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getLandlordId())
                .type(type)
                .priority(priority)
                .channel(channel)
                .title(title)
                .message(message)
                .shortMessage(shortMessage)
                .relatedEntityId(event.getContractId())
                .relatedEntityType("CONTRACT")
                .actionUrl("/contracts/" + event.getContractId())
                .actionText("Xem chi tiết")
                .build());

        // Notify tenant
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getTenantId())
                .type(type)
                .priority(priority)
                .channel(channel)
                .title(title)
                .message(message)
                .shortMessage(shortMessage)
                .relatedEntityId(event.getContractId())
                .relatedEntityType("CONTRACT")
                .actionUrl("/contracts/" + event.getContractId())
                .actionText("Xem chi tiết")
                .build());
    }
}