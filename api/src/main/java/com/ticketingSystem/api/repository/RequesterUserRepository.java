package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RequesterUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RequesterUserRepository extends JpaRepository<RequesterUser, String> {
    Optional<RequesterUser> findByUsername(String username);

    @Query("SELECT r FROM RequesterUser r WHERE " +
            "(:query IS NULL OR :query = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(r.emailId) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.mobileNo) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:officeCode IS NULL OR :officeCode = '' OR LOWER(r.officeCode) LIKE LOWER(CONCAT('%', :officeCode, '%'))) " +
            "AND (:roleId IS NULL OR :roleId = '' OR r.roles LIKE CONCAT('%', :roleId, '%')) " +
            "AND (:stakeholderId IS NULL OR :stakeholderId = '' OR r.stakeholder LIKE CONCAT('%', :stakeholderId, '%')) " +
            "AND (:officeType IS NULL OR :officeType = '' OR r.officeType = :officeType) " +
            "AND (:zoneCode IS NULL OR :zoneCode = '' OR r.zoneCode = :zoneCode) " +
            "AND (:regionCode IS NULL OR :regionCode = '' OR r.regionCode = :regionCode) " +
            "AND (:districtCode IS NULL OR :districtCode = '' OR r.districtCode = :districtCode)")
    Page<RequesterUser> searchUsers(@Param("query") String query,
                                    @Param("roleId") String roleId,
                                    @Param("stakeholderId") String stakeholderId,
                                    @Param("officeCode") String officeCode,
                                    @Param("officeType") String officeType,
                                    @Param("zoneCode") String zoneCode,
                                    @Param("regionCode") String regionCode,
                                    @Param("districtCode") String districtCode,
                                    Pageable pageable);

    @Query("SELECT DISTINCT r.officeType FROM RequesterUser r WHERE r.officeType IS NOT NULL AND r.officeType <> ''")
    List<String> findDistinctOfficeTypes();
}
