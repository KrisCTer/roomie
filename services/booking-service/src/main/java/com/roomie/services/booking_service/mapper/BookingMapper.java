package com.roomie.services.booking_service.mapper;

import com.roomie.services.booking_service.dto.request.BookingRequest;
import com.roomie.services.booking_service.dto.response.BookingResponse;
import com.roomie.services.booking_service.entity.LeaseLongTerm;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    LeaseLongTerm toLeaseEntity(BookingRequest req);
    BookingResponse leaseToResponse(LeaseLongTerm e);
}
