-- Function to add karma
CREATE OR REPLACE FUNCTION add_karma(
  target_user_id UUID,
  karma_amount INTEGER,
  karma_reason TEXT,
  karma_source_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_karma INTEGER;
BEGIN
  INSERT INTO karma_log (user_id, amount, reason, source_id)
  VALUES (target_user_id, karma_amount, karma_reason, karma_source_id);

  UPDATE profiles
  SET karma = karma + karma_amount,
      updated_at = NOW()
  WHERE id = target_user_id
  RETURNING karma INTO new_karma;

  PERFORM update_ring_level(target_user_id);

  RETURN new_karma;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update ring level
CREATE OR REPLACE FUNCTION update_ring_level(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  profile_record RECORD;
  new_ring INTEGER;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = target_user_id;

  new_ring := 0;

  IF profile_record.active_days >= 3
     AND profile_record.phone IS NOT NULL
     AND profile_record.warnings_count = 0 THEN
    new_ring := 1;
  END IF;

  IF profile_record.active_days >= 14
     AND profile_record.messages_with_reactions_count >= 10
     AND profile_record.karma >= 50
     AND profile_record.bans_count = 0 THEN
    new_ring := 2;
  END IF;

  IF profile_record.active_days >= 60
     AND profile_record.successful_chats_count >= 5
     AND profile_record.karma >= 200 THEN
    new_ring := 3;
  END IF;

  -- Хранитель: понизить если карма упала ниже 1000
  IF profile_record.ring = 4 AND profile_record.karma < 1000 THEN
    new_ring := 3;
  ELSIF profile_record.ring = 4 THEN
    new_ring := 4;
  END IF;

  IF new_ring != profile_record.ring THEN
    UPDATE profiles SET ring = new_ring, updated_at = NOW() WHERE id = target_user_id;
  END IF;

  RETURN new_ring;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment active_days (call on each login)
CREATE OR REPLACE FUNCTION increment_active_day(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET active_days = active_days + 1,
      last_seen = NOW(),
      updated_at = NOW()
  WHERE id = target_user_id
    AND last_seen < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check message rate limit (anti-spam)
CREATE OR REPLACE FUNCTION check_message_rate_limit(
  sender_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_ring INTEGER;
  messages_last_hour INTEGER;
  max_messages INTEGER;
BEGIN
  SELECT ring INTO user_ring FROM profiles WHERE id = sender_id;

  CASE user_ring
    WHEN 0 THEN max_messages := 10;
    WHEN 1 THEN max_messages := 60;
    WHEN 2 THEN max_messages := 120;
    WHEN 3 THEN max_messages := 300;
    WHEN 4 THEN max_messages := 1000;
    ELSE max_messages := 10;
  END CASE;

  SELECT COUNT(*) INTO messages_last_hour
  FROM messages
  WHERE user_id = sender_id
    AND created_at > NOW() - INTERVAL '1 hour';

  RETURN messages_last_hour < max_messages;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: award karma when a reaction is added
CREATE OR REPLACE FUNCTION on_reaction_added()
RETURNS TRIGGER AS $$
DECLARE
  message_author_id UUID;
  karma_amount INTEGER;
BEGIN
  SELECT user_id INTO message_author_id FROM messages WHERE id = NEW.message_id;

  IF message_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  CASE NEW.reaction_type
    WHEN 'thanks' THEN karma_amount := 10;
    WHEN 'like' THEN karma_amount := 5;
    WHEN 'funny' THEN karma_amount := 3;
    ELSE karma_amount := 1;
  END CASE;

  PERFORM add_karma(message_author_id, karma_amount, 'reaction_received', NEW.message_id);

  UPDATE profiles
  SET messages_with_reactions_count = (
    SELECT COUNT(DISTINCT m.id)
    FROM messages m
    JOIN reactions r ON r.message_id = m.id
    WHERE m.user_id = message_author_id
  ),
  updated_at = NOW()
  WHERE id = message_author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_added_trigger
  AFTER INSERT ON reactions
  FOR EACH ROW EXECUTE FUNCTION on_reaction_added();

-- Trigger: reduce karma when a report is created
CREATE OR REPLACE FUNCTION on_report_created()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reported_user_id IS NOT NULL THEN
    PERFORM add_karma(NEW.reported_user_id, -50, 'report_received', NEW.id);

    UPDATE profiles
    SET warnings_count = warnings_count + 1,
        updated_at = NOW()
    WHERE id = NEW.reported_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_report_created_trigger
  AFTER INSERT ON reports
  FOR EACH ROW EXECUTE FUNCTION on_report_created();
