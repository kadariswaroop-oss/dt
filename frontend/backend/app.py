from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import ALLOWED_EXTENSIONS, BASE_DIR, BREED_CONFIG, MAX_UPLOAD_SIZE, UPLOAD_DIR, get_breed_metadata
from db import delete_prediction, get_analytics, get_prediction, get_predictions, init_db, record_prediction
from predict import MODEL_NOT_TRAINED_MESSAGE, predict_image_file, predict_from_uploaded_file

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
init_db()


def _get_uploaded_file_size(file_storage) -> int:
    if file_storage is None:
        return 0

    original_seek = None
    try:
        original_seek = file_storage.tell()
    except (AttributeError, OSError):
        original_seek = None

    try:
        file_storage.seek(0, os.SEEK_END)
        size = file_storage.tell()
    except (AttributeError, OSError):
        return 0
    finally:
        if original_seek is not None:
            try:
                file_storage.seek(original_seek)
            except (AttributeError, OSError):
                pass
        else:
            try:
                file_storage.seek(0)
            except (AttributeError, OSError):
                pass

    return int(size)


@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok", "message": "API is running"})


@app.post("/api/predict")
def predict():
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image file was uploaded."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Please choose an image file."}), 400

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({"success": False, "error": "Unsupported file format. Use JPG, JPEG, or PNG images only."}), 400

    file_size = _get_uploaded_file_size(file)
    if file_size > MAX_UPLOAD_SIZE:
        return jsonify({"success": False, "error": "Image is too large. Please upload an image under 5MB."}), 400

    try:
        result = predict_from_uploaded_file(file)
        prediction_id = record_prediction(
            result["image_path"],
            result["breed"],
            result["category"],
            result["confidence"],
        )
        return jsonify(
            {
                "success": True,
                "breed": result["breed"],
                "category": result["category"],
                "confidence": result["confidence"],
                "display_name": result["display_name"],
                "origin": result["origin"],
                "description": result["description"],
                "image_url": result["image_path"],
                "prediction_id": prediction_id,
            }
        )
    except FileNotFoundError as exc:
        return jsonify({"success": False, "error": str(exc)}), 404
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover - broad safety net for runtime issues
        return jsonify({"success": False, "error": "Prediction failed. Please try another image."}), 500


@app.get("/api/predictions")
def list_predictions():
    return jsonify({"success": True, "predictions": get_predictions()})


@app.get("/api/predictions/<int:prediction_id>")
def get_prediction_detail(prediction_id: int):
    prediction = get_prediction(prediction_id)
    if prediction is None:
        return jsonify({"success": False, "error": "Prediction not found."}), 404
    return jsonify({"success": True, "prediction": prediction})


@app.delete("/api/predictions")
def delete_prediction_route():
    prediction_id = request.args.get("id", type=int)
    if prediction_id is None:
        return jsonify({"success": False, "error": "Prediction id is required."}), 400
    deleted = delete_prediction(prediction_id)
    if not deleted:
        return jsonify({"success": False, "error": "Prediction not found."}), 404
    return jsonify({"success": True, "message": "Prediction deleted."})


@app.delete("/api/predictions/<int:prediction_id>")
def delete_prediction_detail(prediction_id: int):
    deleted = delete_prediction(prediction_id)
    if not deleted:
        return jsonify({"success": False, "error": "Prediction not found."}), 404
    return jsonify({"success": True, "message": "Prediction deleted."})


@app.get("/api/analytics")
def analytics():
    return jsonify({"success": True, "analytics": get_analytics()})


@app.get("/api/breeds")
def breeds():
    return jsonify(
        {
            "success": True,
            "breeds": [
                {
                    "name": name,
                    "display_name": name.replace("_", " "),
                    **get_breed_metadata(name),
                }
                for name in sorted(BREED_CONFIG.keys())
            ],
        }
    )


@app.get("/api/breeds/<breed_name>")
def breed_detail(breed_name: str):
    normalized = breed_name.strip()
    breed = BREED_CONFIG.get(normalized) or BREED_CONFIG.get(normalized.replace(" ", "_"))
    if breed is None:
        return jsonify({"success": False, "error": "Breed not found."}), 404
    metadata = get_breed_metadata(normalized.replace(" ", "_"))
    metadata["name"] = normalized.replace(" ", "_")
    return jsonify({"success": True, "breed": metadata})


@app.post("/api/train")
def train_route():
    try:
        from train import run_training

        output = run_training()
        return jsonify({"success": True, "message": "Model trained successfully.", "output": output})
    except Exception as exc:  # pragma: no cover - runtime safety net
        return jsonify({"success": False, "error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
