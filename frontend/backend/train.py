from pathlib import Path

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

from config import DATASET_DIR, MODEL_DIR, MODEL_PATH, SUPPORTED_BREEDS, discover_dataset_classes


def _build_dataset(directory: Path, class_names: list[str], subset_name: str):
    return tf.keras.utils.image_dataset_from_directory(
        directory,
        labels="inferred",
        label_mode="categorical",
        class_names=class_names,
        color_mode="rgb",
        image_size=(224, 224),
        batch_size=32,
        shuffle=subset_name == "train",
        interpolation="bilinear",
    )


def run_training():
    training_dir = DATASET_DIR / "train"
    validation_dir = DATASET_DIR / "valid"
    test_dir = DATASET_DIR / "test"

    if not training_dir.exists() or not validation_dir.exists() or not test_dir.exists():
        raise FileNotFoundError(
            "Dataset directories are missing. Please create dataset/train, dataset/valid, and dataset/test with the six breed folders."
        )

    class_names = discover_dataset_classes(training_dir)
    if not class_names:
        raise ValueError("No class folders found in dataset/train.")

    for directory in (training_dir, validation_dir, test_dir):
        for class_name in class_names:
            if not (directory / class_name).exists():
                raise FileNotFoundError(f"Expected {directory / class_name} to exist for the breed '{class_name}'.")

    train_ds = _build_dataset(training_dir, class_names, "train")
    valid_ds = _build_dataset(validation_dir, class_names, "valid")
    test_ds = _build_dataset(test_dir, class_names, "test")

    augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal_and_vertical"),
            tf.keras.layers.RandomRotation(0.1),
            tf.keras.layers.RandomZoom(0.1),
        ]
    )

    base_model = tf.keras.applications.MobileNetV2(
        include_top=False,
        weights="imagenet",
        input_shape=(224, 224, 3),
        pooling="avg",
    )
    base_model.trainable = False

    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = tf.keras.layers.Dense(256, activation="relu")(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(len(class_names), activation="softmax")(x)
    model = tf.keras.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    early_stopping = tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=5,
        restore_best_weights=True,
    )
    checkpoint = tf.keras.callbacks.ModelCheckpoint(
        str(MODEL_PATH),
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    )

    history = model.fit(
        train_ds,
        validation_data=valid_ds,
        epochs=20,
        callbacks=[early_stopping, checkpoint],
        verbose=1,
    )

    test_loss, test_accuracy = model.evaluate(test_ds, verbose=0)
    y_true = np.concatenate([y for _, y in test_ds], axis=0)
    y_pred = model.predict(test_ds, verbose=0)
    y_true_labels = np.argmax(y_true, axis=1)
    y_pred_labels = np.argmax(y_pred, axis=1)

    print(f"Training Accuracy: {max(history.history['accuracy']) * 100:.2f}%")
    print(f"Validation Accuracy: {max(history.history['val_accuracy']) * 100:.2f}%")
    print(f"Test Accuracy: {test_accuracy * 100:.2f}%")
    print(classification_report(y_true_labels, y_pred_labels, target_names=class_names))
    print(confusion_matrix(y_true_labels, y_pred_labels))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save(str(MODEL_PATH))
    return {
        "class_names": class_names,
        "test_accuracy": round(float(test_accuracy * 100), 2),
        "validation_accuracy": round(float(max(history.history["val_accuracy"]) * 100), 2),
    }


if __name__ == "__main__":
    run_training()
