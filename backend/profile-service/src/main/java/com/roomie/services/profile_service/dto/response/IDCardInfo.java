package com.roomie.services.profile_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IDCardInfo {
    String fullName;
    String idNumber;
    LocalDate dob; // yyyy-MM-dd
    String gender;
    String address;
}
