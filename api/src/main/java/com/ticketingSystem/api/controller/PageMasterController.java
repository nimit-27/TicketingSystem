package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.PageMasterDto;
import com.ticketingSystem.api.service.PageMasterService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/pages")
@AllArgsConstructor
public class PageMasterController {
    private final PageMasterService pageMasterService;

    @GetMapping
    public ResponseEntity<List<PageMasterDto>> getAllPages() {
        return ResponseEntity.ok(pageMasterService.getAllPages());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PageMasterDto>> getActivePages() {
        return ResponseEntity.ok(pageMasterService.getActivePages());
    }

    @GetMapping("/active/sidebar")
    public ResponseEntity<List<PageMasterDto>> getActiveSidebarPages() {
        return ResponseEntity.ok(pageMasterService.getActiveSidebarPages());
    }

    @GetMapping("/{pageId}")
    public ResponseEntity<PageMasterDto> getPageById(@PathVariable Long pageId) {
        return pageMasterService.getPageById(pageId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
