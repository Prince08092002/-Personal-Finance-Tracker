-- Prevent duplicate default categories (user_id IS NULL) by name.

DROP TRIGGER IF EXISTS categories_before_insert;
DROP TRIGGER IF EXISTS categories_before_update;

DELIMITER $$

CREATE TRIGGER categories_before_insert
BEFORE INSERT ON categories
FOR EACH ROW
BEGIN
  IF NEW.user_id IS NULL THEN
    IF EXISTS (
      SELECT 1
      FROM categories c
      WHERE c.user_id IS NULL AND c.name = NEW.name
      LIMIT 1
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Default category already exists';
    END IF;
  END IF;
END$$

CREATE TRIGGER categories_before_update
BEFORE UPDATE ON categories
FOR EACH ROW
BEGIN
  IF NEW.user_id IS NULL THEN
    IF EXISTS (
      SELECT 1
      FROM categories c
      WHERE c.user_id IS NULL AND c.name = NEW.name AND c.id <> OLD.id
      LIMIT 1
    ) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Default category already exists';
    END IF;
  END IF;
END$$

DELIMITER ;

