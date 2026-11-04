import sqlite3
from pathlib import Path

from config import DATABASE_PATH


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    database_path = Path(DATABASE_PATH)
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = get_connection()
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT NOT NULL,
            breed TEXT NOT NULL,
            category TEXT NOT NULL,
            confidence REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    connection.commit()
    connection.close()


def record_prediction(image_path: str, breed: str, category: str, confidence: float) -> int:
    connection = get_connection()
    cursor = connection.execute(
        """
        INSERT INTO predictions (image_path, breed, category, confidence)
        VALUES (?, ?, ?, ?)
        """,
        (image_path, breed, category, confidence),
    )
    prediction_id = cursor.lastrowid
    connection.commit()
    connection.close()
    return int(prediction_id)


def get_predictions() -> list[dict]:
    connection = get_connection()
    rows = connection.execute(
        """
        SELECT *
        FROM predictions
        ORDER BY created_at DESC
        """
    ).fetchall()
    connection.close()
    return [dict(row) for row in rows]


def get_prediction(prediction_id: int) -> dict | None:
    connection = get_connection()
    row = connection.execute(
        "SELECT * FROM predictions WHERE id = ?",
        (prediction_id,),
    ).fetchone()
    connection.close()
    return dict(row) if row else None


def delete_prediction(prediction_id: int) -> bool:
    connection = get_connection()
    cursor = connection.execute(
        "DELETE FROM predictions WHERE id = ?",
        (prediction_id,),
    )
    connection.commit()
    connection.close()
    return cursor.rowcount > 0


def get_analytics() -> dict:
    connection = get_connection()
    total = connection.execute("SELECT COUNT(*) AS value FROM predictions").fetchone()["value"]
    cattle = connection.execute(
        "SELECT COUNT(*) AS value FROM predictions WHERE category = 'Cattle'"
    ).fetchone()["value"]
    buffalo = connection.execute(
        "SELECT COUNT(*) AS value FROM predictions WHERE category = 'Buffalo'"
    ).fetchone()["value"]
    avg_confidence = connection.execute(
        "SELECT COALESCE(AVG(confidence), 0) AS value FROM predictions"
    ).fetchone()["value"]
    breed_counts = connection.execute(
        """
        SELECT breed, COUNT(*) AS count
        FROM predictions
        GROUP BY breed
        ORDER BY count DESC, breed ASC
        """
    ).fetchall()
    time_series = connection.execute(
        """
        SELECT date(created_at) AS label, COUNT(*) AS count
        FROM predictions
        GROUP BY date(created_at)
        ORDER BY label ASC
        """
    ).fetchall()
    connection.close()
    return {
        "total_predictions": total,
        "cattle_predictions": cattle,
        "buffalo_predictions": buffalo,
        "average_confidence": round(float(avg_confidence or 0), 2),
        "breed_distribution": [
            {"breed": row["breed"], "count": row["count"]} for row in breed_counts
        ],
        "time_series": [
            {"label": row["label"], "count": row["count"]} for row in time_series
        ],
    }
