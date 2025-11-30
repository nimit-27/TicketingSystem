package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.RnoAppointedUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RnoAppointedUserRepository extends JpaRepository<RnoAppointedUser, String> {
    Optional<RnoAppointedUser> findByRequesterUserRequesterUserId(String requesterUserId);
}
