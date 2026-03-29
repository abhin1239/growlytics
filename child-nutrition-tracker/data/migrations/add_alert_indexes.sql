-- Performance indexes for alert-vaccination integration
-- Run once to apply. Safe to re-run (uses IF NOT EXISTS equivalent for MySQL)

-- Index for cron query: filter by status + date
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DELIMITER //
CREATE PROCEDURE add_index_if_not_exists(
    tbl VARCHAR(128), idx VARCHAR(128), cols VARCHAR(256)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = tbl
          AND index_name = idx
    ) THEN
        SET @sql = CONCAT('CREATE INDEX ', idx, ' ON ', tbl, '(', cols, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Created index: ', idx) AS result;
    ELSE
        SELECT CONCAT('Index already exists: ', idx) AS result;
    END IF;
END //
DELIMITER ;

CALL add_index_if_not_exists('vaccinations', 'idx_vax_status_date', 'status, alert_start_date');
CALL add_index_if_not_exists('vaccinations', 'idx_vax_child_status', 'child_id, status');
CALL add_index_if_not_exists('alerts', 'idx_alerts_child_vax', 'child_id, vax_name, is_dismissed');
CALL add_index_if_not_exists('alerts', 'idx_alerts_role_region', 'target_role, target_region, is_dismissed');
CALL add_index_if_not_exists('alerts', 'idx_alerts_user_dismissed', 'user_id, is_dismissed');

DROP PROCEDURE IF EXISTS add_index_if_not_exists;
