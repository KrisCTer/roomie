package com.roomie.services.property_service.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(indexName = "properties")
public class PropertyDocument {
    @Id
    String propertyId;

    @Field(type = FieldType.Text, analyzer = "standard")
    String title;
    @Field(type = FieldType.Text, analyzer = "standard")
    String description;

    @Field(type = FieldType.Double)
    Double price;
    @Field(type = FieldType.Keyword)
    String priceLabel;
    @Field(type = FieldType.Double)
    Double rentalDeposit;

    @Field(type = FieldType.Keyword)
    String propertyType;
    @Field(type = FieldType.Keyword)
    String propertyStatus;
    @Field(type = FieldType.Keyword)
    String propertyLabel;

    @Field(type = FieldType.Double)
    Double size;
    @Field(type = FieldType.Double)
    Double landArea;

    @Field(type = FieldType.Integer)
    Integer rooms;
    @Field(type = FieldType.Integer)
    Integer bedrooms;
    @Field(type = FieldType.Integer)
    Integer bathrooms;
    @Field(type = FieldType.Integer)
    Integer garages;

    @Field(type = FieldType.Integer)
    Integer yearBuilt;

    @Field(type = FieldType.Keyword)
    String fullAddress;
    @Field(type = FieldType.Keyword)
    String province;
    @Field(type = FieldType.Keyword)
    String district;
    @Field(type = FieldType.Keyword)
    String ward;
    @Field(type = FieldType.Keyword)
    String street;
    @Field(type = FieldType.Keyword)
    String houseNumber;
    @GeoPointField
    String location; // "lat,lon"

    @Field(type = FieldType.Nested)
    List<String> homeSafety;
    @Field(type = FieldType.Nested)
    List<String> bedroom;
    @Field(type = FieldType.Nested)
    List<String> kitchen;
    @Field(type = FieldType.Nested)
    List<String> others;

    @Field(type = FieldType.Nested)
    List<Media> mediaList;
    @Field(type = FieldType.Object)
    VirtualTour virtualTour;

    @Field(type = FieldType.Object)
    Owner owner;
    @Field(type = FieldType.Keyword)
    String status;
    @Field(type = FieldType.Keyword)
    String rentalType;

    @Field(type = FieldType.Date, format = {DateFormat.strict_date_optional_time_nanos, DateFormat.epoch_millis})
    Instant createdAt;
    @Field(type = FieldType.Date, format = {DateFormat.strict_date_optional_time_nanos, DateFormat.epoch_millis})
    Instant updatedAt;
}
