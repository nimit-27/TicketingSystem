package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.ChangePasswordRequest;
import com.ticketingSystem.api.dto.CreateUserRequest;
import com.ticketingSystem.api.dto.HelpdeskUserDto;
import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.exception.RateLimitExceededException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.Level;
import com.ticketingSystem.api.models.RequesterUser;
import com.ticketingSystem.api.models.Stakeholder;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.models.UserLevel;
import com.ticketingSystem.api.repository.LevelRepository;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class UserService {
    private static final String DEFAULT_PASSWORD = "AnnaDarpan@123";
    static final int MAX_PASSWORD_ATTEMPTS = 5;
    static final Duration PASSWORD_ATTEMPT_WINDOW = Duration.ofMinutes(5);
    static final Duration PASSWORD_LOCK_DURATION = Duration.ofMinutes(5);
    private static final int BCRYPT_MAX_BYTES = 72;
    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "123456", "123456789", "qwerty", "letmein",
            "welcome", "football", "monkey", "abc123", "admin",
            "pass@123", "password1", "iloveyou", "111111"
    );

    private final UserRepository userRepository;
    private final StakeholderRepository stakeholderRepository;
    private final RoleRepository roleRepository;
    private final RequesterUserRepository requesterUserRepository;
    private final LevelRepository levelRepository;

    public UserService(UserRepository userRepository, StakeholderRepository stakeholderRepository,
                       RoleRepository roleRepository, LevelRepository levelRepository,
                       RequesterUserRepository requesterUserRepository) {
        this.userRepository = userRepository;
        this.stakeholderRepository = stakeholderRepository;
        this.roleRepository = roleRepository;
        this.levelRepository = levelRepository;
        this.requesterUserRepository = requesterUserRepository;
    }

    private final Map<String, PasswordAttempt> passwordAttempts = new ConcurrentHashMap<>();

    public Optional<UserDto> getUserDetails(String userId) {
        return userRepository.findById(userId).map(this::mapUserWithStakeholder);
    }

    public Optional<UserDto> getUserDetailsByUsername(String username) {
        if (username == null || username.isBlank()) {
            return Optional.empty();
        }
        return userRepository.findByUsername(username.trim()).map(this::mapUserWithStakeholder);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserWithStakeholder)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<HelpdeskUserDto> getAllHelpdeskUsers() {
        return userRepository.findAll().stream()
                .map(this::mapHelpdeskUser)
                .filter(Objects::nonNull)
                .toList();
    }

    public Optional<HelpdeskUserDto> getHelpdeskUserDetails(String userId) {
        return userRepository.findById(userId).map(this::mapHelpdeskUser);
    }

    public PaginationResponse<HelpdeskUserDto> searchHelpdeskUsers(String query, String roleId, String stakeholderId, Pageable pageable) {
        Page<User> page = userRepository.searchUsers(trimToNull(query), trimToNull(roleId), trimToNull(stakeholderId), pageable);
        List<HelpdeskUserDto> items = page.getContent().stream()
                .map(this::mapHelpdeskUser)
                .filter(Objects::nonNull)
                .toList();
        return new PaginationResponse<>(items, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        validateUsername(request.getUsername());

        List<String> roleIds = sanitizeList(request.getRoleIds());
        List<String> stakeholderIds = sanitizeList(request.getStakeholderIds());
        List<String> levelIds = sanitizeList(request.getLevelIds());

        if (roleIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one role is required");
        }
        if (stakeholderIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one stakeholder is required");
        }
        if (levelIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one level is required");
        }

        ensureRolesExist(roleIds);
        ensureStakeholdersExist(stakeholderIds);
        ensureLevelsExist(levelIds);

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setName(request.getName().trim());
        user.setEmailId(request.getEmailId().trim());
        user.setMobileNo(request.getMobileNo().trim());
        user.setOffice(request.getOffice().trim());
        user.setRoles(String.join("|", roleIds));
        user.setStakeholder(String.join("|", stakeholderIds));
        user.setPassword(encodePassword(DEFAULT_PASSWORD));

        UserLevel userLevel = new UserLevel();
        userLevel.setLevelIds(String.join("|", levelIds));
        userLevel.setLevelId(levelIds.get(0));
        userLevel.setUser(user);
        user.setUserLevel(userLevel);

        User saved = userRepository.save(user);
        return mapUserWithStakeholder(saved);
    }

    public List<UserDto> getUsersByRoles(List<String> roleIds) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    if (user.getRoles() == null) return false;
                    String[] roles = user.getRoles().split("\\|");
                    return Arrays.stream(roles).anyMatch(roleIds::contains);
                })
                .map(this::mapUserWithStakeholder)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public Optional<User> updateUser(String id, User updated) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setEmailId(updated.getEmailId());
                    existing.setMobileNo(updated.getMobileNo());
                    existing.setOffice(updated.getOffice());
                    existing.setUsername(updated.getUsername());
                    return userRepository.save(existing);
                });
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public void changePassword(String userId, ChangePasswordRequest request) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }

        assertNotRateLimited(userId);
        Optional<User> userOptional = Optional.empty();
        Optional<RequesterUser> requesterUserOptional = Optional.empty();

        String stakeholderId = getUserDetails(userId).get().getStakeholderId();
        if("1".equals(stakeholderId)) {
            userOptional = userRepository.findById(userId);
        } else {
            requesterUserOptional = requesterUserRepository.findById(userId);
        }


        if (userOptional.isEmpty() && requesterUserOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        AccountTarget target = resolveAccountTarget(userOptional, requesterUserOptional);

        String oldPassword = trimToNull(request.getOldPassword());
        String newPassword = trimToNull(request.getNewPassword());

        if (oldPassword == null || newPassword == null) {
            recordFailedAttempt(userId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Old and new password are required");
        }

        if (!passwordsMatch(target.currentPasswordSupplier().get(), oldPassword)) {
            recordFailedAttempt(userId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The old password you entered is incorrect.");
        }

        if (passwordsMatch(target.currentPasswordSupplier().get(), newPassword)) {
            recordFailedAttempt(userId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must not match your recent passwords.");
        }

        validatePasswordStrength(newPassword);

        target.passwordUpdater().accept(encodePassword(newPassword));
        target.persistAction().run();
        passwordAttempts.remove(userId);
    }

    private AccountTarget resolveAccountTarget(Optional<User> userOptional, Optional<RequesterUser> requesterUserOptional) {
        Integer stakeholderGroupId = userOptional
                .map(User::getStakeholder)
                .map(this::resolveStakeholderGroupId)
                .orElse(null);

        if (stakeholderGroupId == null && requesterUserOptional.isPresent()) {
            stakeholderGroupId = resolveStakeholderGroupId(requesterUserOptional.get().getStakeholder());
        }

        if (Integer.valueOf(3).equals(stakeholderGroupId)) {
            RequesterUser requesterUser = requesterUserOptional
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requester user not found"));
            return new AccountTarget(requesterUser::getPassword, requesterUser::setPassword,
                    () -> requesterUserRepository.save(requesterUser));
        }

        if (Integer.valueOf(1).equals(stakeholderGroupId)) {
            User user = userOptional
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            return new AccountTarget(user::getPassword, user::setPassword, () -> userRepository.save(user));
        }

        if (stakeholderGroupId == null) {
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                return new AccountTarget(user::getPassword, user::setPassword, () -> userRepository.save(user));
            }
            if (requesterUserOptional.isPresent()) {
                RequesterUser requesterUser = requesterUserOptional.get();
                return new AccountTarget(requesterUser::getPassword, requesterUser::setPassword,
                        () -> requesterUserRepository.save(requesterUser));
            }
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            return new AccountTarget(user::getPassword, user::setPassword, () -> userRepository.save(user));
        }

        RequesterUser requesterUser = requesterUserOptional
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new AccountTarget(requesterUser::getPassword, requesterUser::setPassword,
                () -> requesterUserRepository.save(requesterUser));
    }

    private Integer resolveStakeholderGroupId(String stakeholderIds) {
        List<Integer> numericIds = splitIds(stakeholderIds).stream()
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (numericIds.isEmpty()) {
            return null;
        }

        Map<Integer, Integer> stakeholderGroupById = stakeholderRepository.findAllById(new HashSet<>(numericIds)).stream()
                .collect(Collectors.toMap(
                        Stakeholder::getId,
                        stakeholder -> stakeholder.getStakeholderGroup() != null
                                ? stakeholder.getStakeholderGroup().getId()
                                : null,
                        (existing, replacement) -> existing
                ));

        for (Integer id : numericIds) {
            Integer groupId = stakeholderGroupById.get(id);
            if (groupId != null) {
                return groupId;
            }
        }

        return null;
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }

        String trimmed = password.trim();
        if (trimmed.getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is too long");
        }

        if (trimmed.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters (12+ recommended).");
        }
        if (!trimmed.matches(".*[A-Z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Include at least one uppercase letter.");
        }
        if (!trimmed.matches(".*[a-z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Include at least one lowercase letter.");
        }
        if (!trimmed.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Include at least one number.");
        }
        if (!trimmed.matches(".*[^A-Za-z0-9].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Include at least one special character.");
        }
        if (COMMON_PASSWORDS.contains(trimmed.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avoid commonly used or leaked passwords.");
        }
    }

    private boolean passwordsMatch(String stored, String provided) {
        if (stored == null || provided == null) {
            return false;
        }
        if (isBcryptHash(stored)) {
            if (isBcryptHash(provided)) {
                return Objects.equals(stored, provided);
            }
            int providedLength = provided.getBytes(StandardCharsets.UTF_8).length;
            if (providedLength > BCRYPT_MAX_BYTES) {
                return false;
            }
            try {
                return BCrypt.checkpw(provided, stored);
            } catch (IllegalArgumentException ex) {
                return false;
            }
        }
        return Objects.equals(stored, provided);
    }

    private void assertNotRateLimited(String userId) {
        PasswordAttempt attempt = passwordAttempts.computeIfAbsent(userId, key -> new PasswordAttempt());
        synchronized (attempt) {
            Instant now = Instant.now();
            if (attempt.lockedUntil != null && attempt.lockedUntil.isAfter(now)) {
                long retryAfter = Duration.between(now, attempt.lockedUntil).toSeconds();
                throw new RateLimitExceededException("Too many attempts. Please try again later.", retryAfter);
            }
            if (attempt.windowStart == null || attempt.windowStart.plus(PASSWORD_ATTEMPT_WINDOW).isBefore(now)) {
                attempt.windowStart = now;
                attempt.attempts = 0;
                attempt.lockedUntil = null;
            }
        }
    }

    private void recordFailedAttempt(String userId) {
        PasswordAttempt attempt = passwordAttempts.computeIfAbsent(userId, key -> new PasswordAttempt());
        synchronized (attempt) {
            Instant now = Instant.now();
            if (attempt.windowStart == null || attempt.windowStart.plus(PASSWORD_ATTEMPT_WINDOW).isBefore(now)) {
                attempt.windowStart = now;
                attempt.attempts = 0;
                attempt.lockedUntil = null;
            }
            attempt.attempts++;
            if (attempt.attempts >= MAX_PASSWORD_ATTEMPTS) {
                attempt.lockedUntil = now.plus(PASSWORD_LOCK_DURATION);
                attempt.attempts = 0;
                throw new RateLimitExceededException("Too many attempts. Please try again later.",
                        Duration.between(now, attempt.lockedUntil).toSeconds());
            }
        }
    }

    private record AccountTarget(Supplier<String> currentPasswordSupplier,
                                 Consumer<String> passwordUpdater,
                                 Runnable persistAction) {
    }

    private static class PasswordAttempt {
        Instant windowStart;
        int attempts;
        Instant lockedUntil;
    }

    private HelpdeskUserDto mapHelpdeskUser(User user) {
        HelpdeskUserDto dto = DtoMapper.toHelpdeskUserDto(user);
        if (dto == null) {
            return null;
        }

        List<String> roleIds = splitIds(user.getRoles());
        List<String> roleNames = resolveRoleNames(user.getRoles());

        dto.setRoleIds(roleIds);
        dto.setRoleNames(roleNames);
        dto.setRoles(roleNames.isEmpty() ? null : String.join(", ", roleNames));
        dto.setStakeholderId(user.getStakeholder());
        dto.setStakeholder(resolveStakeholderName(user.getStakeholder()));
        if (dto.getLevels() == null) {
            dto.setLevels(Collections.emptyList());
        }

        return dto;
    }

    private void validateUsername(String username) {
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        String trimmed = username.trim();
        if (!isUsernameAvailable(trimmed)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
    }

    public boolean isUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }

        String trimmed = username.trim();
        boolean existsInUsers = userRepository.findByUsername(trimmed).isPresent();
        boolean existsInRequesterUsers = requesterUserRepository.findByUsername(trimmed).isPresent();

        return !(existsInUsers || existsInRequesterUsers);
    }

    private List<String> sanitizeList(List<String> items) {
        if (items == null) {
            return Collections.emptyList();
        }
        return items.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private void ensureRolesExist(List<String> roleIds) {
        List<Integer> numericIds = roleIds.stream()
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (numericIds.isEmpty()) {
            return;
        }

        Map<Integer, Integer> existing = roleRepository.findAllById(numericIds).stream()
                .collect(Collectors.toMap(
                        com.ticketingSystem.api.models.Role::getRoleId,
                        com.ticketingSystem.api.models.Role::getRoleId));

        List<String> missing = numericIds.stream()
                .filter(id -> !existing.containsKey(id))
                .map(String::valueOf)
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid role ids: " + String.join(", ", missing));
        }
    }

    private void ensureStakeholdersExist(List<String> stakeholderIds) {
        List<Integer> numericIds = stakeholderIds.stream()
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toList();

        if (numericIds.isEmpty()) {
            return;
        }

        Map<Integer, Integer> existing = stakeholderRepository.findAllById(new HashSet<>(numericIds)).stream()
                .collect(Collectors.toMap(Stakeholder::getId, Stakeholder::getId));

        List<String> missing = numericIds.stream()
                .filter(id -> !existing.containsKey(id))
                .map(String::valueOf)
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid stakeholder ids: " + String.join(", ", missing));
        }
    }

    private void ensureLevelsExist(List<String> levelIds) {
        if (levelIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one level is required");
        }

        Map<String, String> existing = levelRepository.findAllById(levelIds).stream()
                .collect(Collectors.toMap(Level::getLevelId, Level::getLevelId));

        List<String> missing = levelIds.stream()
                .filter(id -> !existing.containsKey(id))
                .toList();

        if (!missing.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid level ids: " + String.join(", ", missing));
        }
    }

    private String encodePassword(String password) {
        String trimmed = password == null ? "" : password.trim();
        if (trimmed.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (isBcryptHash(trimmed)) {
            return trimmed;
        }
        return BCrypt.hashpw(trimmed, BCrypt.gensalt());
    }

    private boolean isBcryptHash(String value) {
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private List<String> splitIds(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(value.split("\\|"))
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .toList();
    }

    private UserDto mapUserWithStakeholder(User user) {
        UserDto dto = DtoMapper.toUserDto(user);
        if (dto == null) {
            return null;
        }
        dto.setStakeholderId(user.getStakeholder());
        dto.setStakeholder(resolveStakeholderName(user.getStakeholder()));
        dto.setRoleNames(resolveRoleNames(user.getRoles()));
        return dto;
    }

    private String resolveStakeholderName(String stakeholderId) {
        if (stakeholderId == null || stakeholderId.isBlank()) {
            return null;
        }

        List<String> stakeholderParts = Arrays.stream(stakeholderId.split("\\|"))
                .map(String::trim)
                .filter(part -> !part.isEmpty())
                .collect(Collectors.toList());

        if (stakeholderParts.isEmpty()) {
            return stakeholderId;
        }

        List<Integer> numericIds = stakeholderParts.stream()
                .map(part -> {
                    try {
                        return Integer.valueOf(part);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<Integer, String> stakeholderNameById = stakeholderRepository.findAllById(new HashSet<>(numericIds))
                .stream()
                .collect(Collectors.toMap(
                        Stakeholder::getId,
                        Stakeholder::getDescription,
                        (existing, replacement) -> existing));

        List<String> resolvedStakeholders = new ArrayList<>();
        for (String part : stakeholderParts) {
            String resolved = part;
            try {
                Integer id = Integer.valueOf(part);
                resolved = stakeholderNameById.getOrDefault(id, part);
            } catch (NumberFormatException ignored) {
                // Non-numeric stakeholder identifiers are returned as-is
            }
            resolvedStakeholders.add(resolved);
        }

        return String.join("|", resolvedStakeholders);
    }

    private List<String> resolveRoleNames(String roleIds) {
        if (roleIds == null || roleIds.isBlank()) {
            return Collections.emptyList();
        }

        List<Integer> ids = Arrays.stream(roleIds.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(id -> {
                    try {
                        return Integer.valueOf(id);
                    } catch (NumberFormatException ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (ids.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Integer, String> roleNameById = roleRepository.findAllById(ids)
                .stream()
                .collect(Collectors.toMap(
                        com.ticketingSystem.api.models.Role::getRoleId,
                        com.ticketingSystem.api.models.Role::getRole,
                        (existing, replacement) -> existing));

        return ids.stream()
                .map(roleNameById::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
