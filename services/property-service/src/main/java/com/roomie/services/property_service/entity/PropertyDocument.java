package com.roomie.services.property_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.InstantSerializer;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

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
    String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    String title;

    @Field(type = FieldType.Text, analyzer = "standard")
    String description;

    @Field(type = FieldType.Keyword)
    String propertyType;

    @Field(type = FieldType.Keyword)
    String propertyStatus;

    @Field(type = FieldType.Keyword)
    String propertyLabel;

    @Field(type = FieldType.Double)
    Double price;

    @Field(type = FieldType.Keyword)
    String unitPrice;

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

    @Field(type = FieldType.Keyword)
    String province;

    @Field(type = FieldType.Keyword)
    String neighborhood;

    @Field(type = FieldType.Keyword)
    String addressLine;

    @GeoPointField
    String location; // "lat,lon"

    @Field(type = FieldType.Keyword)
    List<Media> mediaList;

    @Field(type = FieldType.Object)
    VirtualTour virtualTour;

    @Field(type = FieldType.Date, format = {DateFormat.strict_date_optional_time_nanos, DateFormat.epoch_millis})
    Instant createdAt;

    @Field(type = FieldType.Date, format = {DateFormat.strict_date_optional_time_nanos, DateFormat.epoch_millis})
    Instant updatedAt;

}
