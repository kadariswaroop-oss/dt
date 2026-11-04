import os
from pathlib import Path
from uuid import uuid4

import numpy as np
from PIL import Image
import tensorflow as tf
from werkzeug.utils import secure_filename

from config import BREED_CONFIG, MAX_UPLOAD_SIZE, MODEL_PATH, SUPPORTED_BREEDS, UPLOAD_DIR, get_display_name

MODEL_NOT_TRAINED_MESSAGE = "Model not trained. Run python train.py first."


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(MODEL_NOT_TRAINED_MESSAGE)
    return tf.keras.models.load_model(str(MODEL_PATH))


def preprocess_image(image_data):
    img = Image.open(image_data).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.asarray(img, dtype=np.float32)
    processed = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    return processed


def normalize_breed_name(breed_name: str) -> str:
    cleaned = breed_name.strip()
    if cleaned in BREED_CONFIG:
        return cleaned
    if cleaned.replace(" ", "_") in BREED_CONFIG:
        return cleaned.replace(" ", "_")
    return cleaned


def predict_image_file(image_path: str) -> dict:
    model = load_model()
    image = Path(image_path)
    if not image.exists():
        raise FileNotFoundError("Uploaded image was not found on disk.")

    processed = preprocess_image(image)
    prediction = model.predict(np.expand_dims(processed, axis=0), verbose=0)[0]
    predicted_index = int(np.argmax(prediction))
    class_names = SUPPORTED_BREEDS
    breed_name = class_names[predicted_index]
    confidence = float(prediction[predicted_index] * 100)
    metadata = BREED_CONFIG.get(breed_name, {})

    return {
        "breed": breed_name,
        "display_name": get_display_name(breed_name),
        "category": metadata.get("category", "Unknown"),
        "origin": metadata.get("origin", "Unknown"),
        "description": metadata.get("description", "No description available."),
        "confidence": round(confidence, 2),
        "probabilities": {name: round(float(prob) * 100, 2) for name, prob in zip(class_names, prediction)},
    }


def predict_from_uploaded_file(file_storage) -> dict:
    if file_storage is None:
        raise ValueError("No image file was provided.")

    try:
        file_storage.seek(0, os.SEEK_END)
        file_size = file_storage.tell()
    except (AttributeError, OSError):
        file_size = 0
    finally:
        try:
            file_storage.seek(0)
        except (AttributeError, OSError):
            pass

    if file_size > MAX_UPLOAD_SIZE:
        raise ValueError("Image is too large. Please upload an image under 5MB.")

    original_name = os.path.basename(file_storage.filename or "upload")
    sanitized_name = secure_filename(original_name) or "upload"
    stem, suffix = os.path.splitext(sanitized_name)
    if not suffix:
        suffix = ".png"
    unique_name = f"{stem or 'upload'}_{uuid4().hex}{suffix}"
    upload_path = UPLOAD_DIR / unique_name
    upload_path.parent.mkdir(parents=True, exist_ok=True)
    file_storage.save(str(upload_path))

    result = predict_image_file(str(upload_path))
    result["image_path"] = str(upload_path)
    return result
