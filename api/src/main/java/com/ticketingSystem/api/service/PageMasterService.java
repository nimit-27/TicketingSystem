package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.PageMasterDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.repository.PageMasterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PageMasterService {
    private final PageMasterRepository pageMasterRepository;

    public PageMasterService(PageMasterRepository pageMasterRepository) {
        this.pageMasterRepository = pageMasterRepository;
    }

    public List<PageMasterDto> getAllPages() {
        return pageMasterRepository.findAll().stream()
                .map(DtoMapper::toPageMasterDto)
                .toList();
    }

    public List<PageMasterDto> getActivePages() {
        return pageMasterRepository.findByIsActiveTrue().stream()
                .map(DtoMapper::toPageMasterDto)
                .toList();
    }

    public List<PageMasterDto> getActiveSidebarPages() {
        return pageMasterRepository.findByIsActiveTrueAndIsOnSidebarTrue().stream()
                .map(DtoMapper::toPageMasterDto)
                .toList();
    }

    public Optional<PageMasterDto> getPageById(Long pageId) {
        return pageMasterRepository.findById(pageId)
                .map(DtoMapper::toPageMasterDto);
    }
}
