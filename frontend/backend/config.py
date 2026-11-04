from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR.parent / "dataset"
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "breed_model.keras"
UPLOAD_DIR = BASE_DIR / "uploads"
DATABASE_PATH = BASE_DIR / "predictions.db"
MAX_UPLOAD_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

BREED_CONFIG = {
    "Gir": {
        "category": "Cattle",
        "origin": "India",
        "description": "A hardy indigenous cattle breed recognized for its resilience and high adaptability in tropical climates.",
    },
    "Holstein_Friesian": {
        "category": "Cattle",
        "origin": "Netherlands / Europe",
        "description": "A high-yield dairy breed prized for milk production and strong commercial dairy value.",
    },
    "Jersey": {
        "category": "Cattle",
        "origin": "Jersey Island",
        "description": "A compact dairy breed known for efficient milk production and excellent butterfat content.",
    },
    "Sahiwal": {
        "category": "Cattle",
        "origin": "South Asia",
        "description": "An indigenous cattle breed valued for heat tolerance, disease resilience, and milk quality.",
    },
    "Jaffrabadi": {
        "category": "Buffalo",
        "origin": "India",
        "description": "A large buffalo breed widely known for high milk yield and strong body structure.",
    },
    "Murrah": {
        "category": "Buffalo",
        "origin": "India",
        "description": "A prominent dairy buffalo breed famous for its efficiency, robustness, and excellent milk output.",
    },
}

SUPPORTED_BREEDS = list(BREED_CONFIG.keys())


def get_display_name(breed_name: str) -> str:
    return breed_name.replace("_", " ")


def get_breed_metadata(breed_name: str) -> dict:
    normalized_name = breed_name.strip()
    if normalized_name in BREED_CONFIG:
        metadata = BREED_CONFIG[normalized_name].copy()
        metadata["breed"] = normalized_name
        metadata["display_name"] = get_display_name(normalized_name)
        return metadata
    fallback = {
        "breed": normalized_name,
        "display_name": get_display_name(normalized_name),
        "category": "Unknown",
        "origin": "Unknown",
        "description": "Breed details are not available for this class.",
    }
    return fallback


def discover_dataset_classes(dataset_root: Path) -> list[str]:
    if not dataset_root.exists():
        return list(BREED_CONFIG.keys())

    available = [path.name for path in dataset_root.iterdir() if path.is_dir()]
    ordered = [name for name in SUPPORTED_BREEDS if name in available]
    extra = [name for name in available if name not in ordered]
    return ordered + extra
