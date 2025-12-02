package com.ticketingSystem.fileManagement.service;

import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.fileManagement.dto.FileUploadRequest;
import com.ticketingSystem.fileManagement.dto.ManagedFileResponse;
import com.ticketingSystem.fileManagement.models.ManagedFile;
import com.ticketingSystem.fileManagement.repository.ManagedFileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileManagementService {

    private final ManagedFileRepository managedFileRepository;

    @Value("${file.management.base-dir:uploads/file-management}")
    private String baseDir;

    public FileManagementService(ManagedFileRepository managedFileRepository) {
        this.managedFileRepository = managedFileRepository;
    }

    public ManagedFileResponse upload(MultipartFile file, FileUploadRequest request, LoginPayload user) throws IOException {
        String cleanedName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String storedName = UUID.randomUUID() + "_" + cleanedName;
        String section = StringUtils.hasText(request.getSection()) ? request.getSection().trim() : "general";
        Path targetDir = Paths.get(baseDir, section);
        Files.createDirectories(targetDir);
        Path target = targetDir.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        ManagedFile managedFile = new ManagedFile();
        managedFile.setOriginalName(cleanedName);
        managedFile.setStoredName(storedName);
        managedFile.setContentType(file.getContentType());
        managedFile.setFileSize(file.getSize());
        managedFile.setSection(section);
        managedFile.setDescription(request.getDescription());
        managedFile.setUploadedBy(user != null ? user.getUserId() : null);
        managedFile.setUploadedByName(user != null ? user.getName() : null);
        managedFile.setStoragePath(section + "/" + storedName);

        if (request.getRoles() != null) {
            request.getRoles().stream()
                    .filter(StringUtils::hasText)
                    .forEach(managedFile::addRole);
        }
        if (request.getUserIds() != null) {
            request.getUserIds().stream()
                    .filter(StringUtils::hasText)
                    .forEach(managedFile::addUser);
        }

        ManagedFile saved = managedFileRepository.save(managedFile);
        return toResponse(saved);
    }

    public List<ManagedFileResponse> listAccessible(LoginPayload user, String section) {
        List<ManagedFile> files = managedFileRepository.findByActiveTrue();
        List<String> userRoles = user != null && user.getRoles() != null ? user.getRoles() : List.of();
        String userId = user != null ? user.getUserId() : null;

        return files.stream()
                .filter(f -> isAccessible(f, userId, userRoles))
                .filter(f -> !StringUtils.hasText(section) || section.equalsIgnoreCase(f.getSection()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ManagedFileResponse getFileMetadata(String id, LoginPayload user) {
        ManagedFile file = managedFileRepository.findById(id).orElse(null);
        if (file == null || !file.isActive()) {
            return null;
        }
        List<String> roles = user != null ? user.getRoles() : List.of();
        String userId = user != null ? user.getUserId() : null;
        if (!isAccessible(file, userId, roles)) {
            return null;
        }
        return toResponse(file);
    }

    public Resource loadFile(String id, LoginPayload user) throws MalformedURLException {
        ManagedFile file = managedFileRepository.findById(id).orElse(null);
        if (file == null || !file.isActive()) {
            return null;
        }
        List<String> roles = user != null ? user.getRoles() : List.of();
        String userId = user != null ? user.getUserId() : null;
        if (!isAccessible(file, userId, roles)) {
            return null;
        }
        Path path = Paths.get(baseDir, file.getStoragePath());
        Resource resource = new UrlResource(path.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        }
        return null;
    }

    private ManagedFileResponse toResponse(ManagedFile managedFile) {
        ManagedFileResponse response = new ManagedFileResponse();
        response.setId(managedFile.getId());
        response.setFileName(managedFile.getOriginalName());
        response.setSection(managedFile.getSection());
        response.setDescription(managedFile.getDescription());
        response.setUploadedBy(managedFile.getUploadedBy());
        response.setUploadedByName(managedFile.getUploadedByName());
        response.setUploadedOn(managedFile.getUploadedOn());
        response.setFileSize(managedFile.getFileSize());
        response.setContentType(managedFile.getContentType());
        response.setRoles(managedFile.getRoles() == null ? List.of() : managedFile.getRoles().stream()
                .map(r -> StringUtils.hasText(r.getRole()) ? r.getRole() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
        response.setUserIds(managedFile.getUsers() == null ? List.of() : managedFile.getUsers().stream()
                .map(u -> StringUtils.hasText(u.getUserId()) ? u.getUserId() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList()));
        response.setStoragePath(managedFile.getStoragePath());
        return response;
    }

    private boolean isAccessible(ManagedFile file, String userId, List<String> userRoles) {
        if (!file.isActive()) {
            return false;
        }
        if (file.getUsers() != null && !file.getUsers().isEmpty()) {
            boolean matchesUser = file.getUsers().stream()
                    .anyMatch(u -> userId != null && userId.equalsIgnoreCase(u.getUserId()));
            if (matchesUser) {
                return true;
            }
        }
        if (file.getRoles() != null && !file.getRoles().isEmpty()) {
            boolean matchesRole = userRoles != null && file.getRoles().stream()
                    .anyMatch(r -> userRoles.stream().anyMatch(role -> role.equalsIgnoreCase(r.getRole())));
            if (matchesRole) {
                return true;
            }
        }
        return userRoles != null && !userRoles.isEmpty();
    }
}
