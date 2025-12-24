package com.roomie.services.notification_service.enums;

public enum NotificationType {
    // Booking related
    BOOKING_CREATED("booking.created"),
    BOOKING_CONFIRMED("booking.confirmed"),
    BOOKING_CANCELLED("booking.cancelled"),
    BOOKING_REJECTED("booking.rejected"),
    BOOKING_EXPIRED("booking.expired"),

    // Contract related
    CONTRACT_CREATED("contract.created"),
    CONTRACT_SIGNED_BY_TENANT("contract.signed.tenant"),
    CONTRACT_SIGNED_BY_LANDLORD("contract.signed.landlord"),
    CONTRACT_PENDING_PAYMENT("contract.pending_payment"),
    CONTRACT_ACTIVATED("contract.activated"),
    CONTRACT_EXPIRING_SOON("contract.expiring_soon"),
    CONTRACT_EXPIRED("contract.expired"),
    CONTRACT_TERMINATED("contract.terminated"),
    CONTRACT_PAUSED("contract.paused"),
    CONTRACT_RENEWED("contract.renewed"),

    // Property related
    PROPERTY_APPROVED("property.approved"),
    PROPERTY_REJECTED("property.rejected"),
    PROPERTY_EXPIRED("property.expired"),
    PROPERTY_RENTED("property.rented"),

    // Payment related
    PAYMENT_COMPLETED("payment.completed"),
    PAYMENT_FAILED("payment.failed"),
    PAYMENT_DUE_SOON("payment.due_soon"),
    PAYMENT_OVERDUE("payment.overdue"),

    // Bill related
    BILL_CREATED("bill.created"),
    BILL_PAID("bill.paid"),
    BILL_OVERDUE("bill.overdue"),

    // Message related
    NEW_MESSAGE("message.new"),
    NEW_CALL("call.new"),

    // Review related
    NEW_REVIEW("review.new"),
    REVIEW_REPLY("review.reply"),

    // System
    SYSTEM_ANNOUNCEMENT("system.announcement"),
    SYSTEM_MAINTENANCE("system.maintenance"),
    ACCOUNT_VERIFIED("account.verified"),
    ACCOUNT_SUSPENDED("account.suspended");

    private final String topic;

    NotificationType(String topic) {
        this.topic = topic;
    }

    public String getTopic() {
        return topic;
    }
}