# AI Cattle & Buffalo Breed Recognition

AI-driven image-based breed recognition and categorization system for cattle and buffaloes.

## Features

- Angular-based dashboard with responsive layout
- Flask REST API for prediction and history endpoints
- TensorFlow/Keras transfer-learning model
- SQLite prediction history storage
- Breed information and analytics pages
- Drag-and-drop image upload and prediction workflow
- Empty-state handling for unavailable model and missing data

## Architecture

- Frontend: Angular 22 + TypeScript + SCSS
- Backend: Python + Flask
- Model: MobileNetV2 transfer-learning CNN
- Database: SQLite
- Dataset: train/valid/test folders for the six breeds

## Dataset Structure

```text
dataset/
├── train/
│   ├── Gir/
│   ├── Holstein_Friesian/
│   ├── Jaffrabadi/
│   ├── Jersey/
│   ├── Murrah/
│   └── Sahiwal/
├── valid/
│   ├── Gir/
│   ├── Holstein_Friesian/
│   ├── Jaffrabadi/
│   ├── Jersey/
│   ├── Murrah/
│   └── Sahiwal/
└── test/
    ├── Gir/
    ├── Holstein_Friesian/
    ├── Jaffrabadi/
    ├── Jersey/
    ├── Murrah/
    └── Sahiwal/
```

## Install and Run

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
# source venv/bin/activate
pip install -r requirements.txt
python train.py
python app.py
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

## API Endpoints

- GET /api/health
- POST /api/predict
- GET /api/predictions
- GET /api/predictions/<id>
- DELETE /api/predictions
- DELETE /api/predictions/<id>
- GET /api/analytics
- GET /api/breeds
- GET /api/breeds/<breed>
- POST /api/train

## Model Training

Train the model with:

```bash
cd backend
python train.py
```

The model is saved to:

```text
backend/models/breed_model.keras
```

## Project Workflow

1. Upload animal image from the Angular dashboard
2. Validate file type and size
3. Send image to Flask API
4. Resize and preprocess image for MobileNetV2
5. Run the saved TensorFlow model
6. Map prediction to breed and category
7. Save result to SQLite
8. Display result and analytics in the dashboard

## Future Enhancements

- Add more breeds and balanced data augmentation
- Deploy the model to a cloud environment
- Add real-time camera capture support
- Add user authentication and email notifications
- Enhance dashboard analytics and reporting

## Local URLs

- Frontend: http://localhost:4200
- Backend: http://localhost:5000
