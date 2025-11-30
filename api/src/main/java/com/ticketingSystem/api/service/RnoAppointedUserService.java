package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.RnoAppointedUserDto;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.RnoAppointedUser;
import com.ticketingSystem.api.models.RnoAppointedUserHistory;
import com.ticketingSystem.api.repository.RnoAppointedUserHistoryRepository;
import com.ticketingSystem.api.repository.RnoAppointedUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RnoAppointedUserService {
    private final RnoAppointedUserRepository rnoAppointedUserRepository;
    private final RnoAppointedUserHistoryRepository rnoAppointedUserHistoryRepository;

    public RnoAppointedUserService(RnoAppointedUserRepository rnoAppointedUserRepository,
                                   RnoAppointedUserHistoryRepository rnoAppointedUserHistoryRepository) {
        this.rnoAppointedUserRepository = rnoAppointedUserRepository;
        this.rnoAppointedUserHistoryRepository = rnoAppointedUserHistoryRepository;
    }

    @Transactional
    public RnoAppointedUserDto recordAppointment(RequesterUser requesterUser, String actor) {
        Optional<RnoAppointedUser> existing = rnoAppointedUserRepository.findByRequesterUserRequesterUserId(requesterUser.getRequesterUserId());

        RnoAppointedUser appointment = existing.orElseGet(RnoAppointedUser::new);
        boolean isNew = appointment.getId() == null;

        appointment.setRequesterUser(requesterUser);
        appointment.setOfficeCode(requesterUser.getOfficeCode());
        appointment.setOfficeType(requesterUser.getOfficeType());
        appointment.setRegionCode(requesterUser.getRegionCode());
        appointment.setActive(Boolean.TRUE);

        if (actor != null && !actor.isBlank()) {
            if (isNew && appointment.getCreatedBy() == null) {
                appointment.setCreatedBy(actor);
            }
            appointment.setUpdatedBy(actor);
        }

        RnoAppointedUser saved = rnoAppointedUserRepository.save(appointment);
        saveHistorySnapshot(saved, actor);
        return DtoMapper.toRnoAppointedUserDto(saved);
    }

    private void saveHistorySnapshot(RnoAppointedUser rnoAppointedUser, String actor) {
        RnoAppointedUserHistory history = new RnoAppointedUserHistory();
        history.setRnoAppointedUser(rnoAppointedUser);
        history.setRequesterUser(rnoAppointedUser.getRequesterUser());
        history.setOfficeCode(rnoAppointedUser.getOfficeCode());
        history.setOfficeType(rnoAppointedUser.getOfficeType());
        history.setRegionCode(rnoAppointedUser.getRegionCode());
        history.setActive(rnoAppointedUser.getActive());
        history.setCreatedBy(rnoAppointedUser.getCreatedBy());
        history.setCreatedOn(rnoAppointedUser.getCreatedOn());
        history.setUpdatedBy(actor != null && !actor.isBlank() ? actor : rnoAppointedUser.getUpdatedBy());
        history.setUpdatedOn(rnoAppointedUser.getUpdatedOn());
        rnoAppointedUserHistoryRepository.save(history);
    }
}
