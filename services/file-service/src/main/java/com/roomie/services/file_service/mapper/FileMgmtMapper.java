package com.roomie.services.file_service.mapper;

import com.roomie.services.file_service.dto.response.FileResponse;
import com.roomie.services.file_service.entity.FileMgmt;
import com.roomie.services.file_service.repository.FileRepository.FileInfo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMgmtMapper {
    @Mapping(source = "originalName", target = "fileName")
    FileMgmt toFileMgmt(FileInfo fileInfo);
    FileResponse toFileResponse(FileMgmt entity);
}