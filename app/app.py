import os
import numpy as np
import json
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import tensorflow as tf
from PIL import Image

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model
model = tf.keras.models.load_model('../model/saved_model')

# Load class indices
with open('../model/class_indices.json', 'r') as f:
    class_indices = json.load(f)
    
# Invert the dictionary to map indices to class names
indices_to_classes = {v: k for k, v in class_indices.items()}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/')
def index():
    return render_template('index.html', classes=list(class_indices.keys()))

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Preprocess the image
        processed_image = preprocess_image(file_path)
        
        # Make prediction
        predictions = model.predict(processed_image)[0]
        
        # Get top 3 predictions
        top_indices = predictions.argsort()[-3:][::-1]
        top_predictions = [
            {
                'class': indices_to_classes[idx],
                'probability': float(predictions[idx]) * 100
            }
            for idx in top_indices
        ]
        
        return render_template(
            'result.html', 
            filename=filename,
            predictions=top_predictions
        )
    
    return jsonify({'error': 'File type not allowed'})

if __name__ == '__main__':
    app.run(debug=True)