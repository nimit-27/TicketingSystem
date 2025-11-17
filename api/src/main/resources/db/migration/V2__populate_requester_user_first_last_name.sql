UPDATE requester_users
SET first_name = NULLIF(TRIM(SUBSTRING_INDEX(COALESCE(name, ''), ' ', 1)), ''),
    last_name = NULLIF(
        TRIM(
            SUBSTRING(
                COALESCE(name, ''),
                LENGTH(SUBSTRING_INDEX(COALESCE(name, ''), ' ', 1)) + 1
            )
        ),
        ''
    );
