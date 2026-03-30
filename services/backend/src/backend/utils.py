import datetime

DAY_MAP = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6,
}


def parse_time_slot(time_slot: str) -> tuple[datetime.time, datetime.time]:
    """Parse a time slot string 'HH:MM-HH:MM' into start and end times."""
    start_str, end_str = time_slot.split("-")
    start = datetime.time.fromisoformat(start_str.strip())
    end = datetime.time.fromisoformat(end_str.strip())
    return start, end


def slots_overlap(slot1: str, slot2: str) -> bool:
    """Return True if two time slots (HH:MM-HH:MM) overlap."""
    s1_start, s1_end = parse_time_slot(slot1)
    s2_start, s2_end = parse_time_slot(slot2)
    return s1_start < s2_end and s2_start < s1_end


def next_class_datetime(day_of_week: str, time_slot: str) -> datetime.datetime:
    """Return the datetime of the next upcoming occurrence of a class."""
    now = datetime.datetime.now()
    target_weekday = DAY_MAP[day_of_week]
    start_time, _ = parse_time_slot(time_slot)

    days_ahead = target_weekday - now.weekday()
    if days_ahead < 0:
        days_ahead += 7
    elif days_ahead == 0:
        class_time_today = datetime.datetime.combine(now.date(), start_time)
        if now >= class_time_today:
            days_ahead = 7

    next_date = now.date() + datetime.timedelta(days=days_ahead)
    return datetime.datetime.combine(next_date, start_time)


def is_within_24h(day_of_week: str, time_slot: str) -> bool:
    """Return True if the next class occurrence is within 24 hours from now."""
    next_dt = next_class_datetime(day_of_week, time_slot)
    now = datetime.datetime.now()
    return (next_dt - now).total_seconds() < 24 * 3600
