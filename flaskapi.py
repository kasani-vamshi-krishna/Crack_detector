
from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from flask_cors import CORS
import numpy as np
import cv2
import os
from keras import models  
import base64
import pymongo

app = Flask(__name__)
CORS(app)

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["temp"]  
collection = db["reports"] 

model_path = 'dude.h5' 
model = load_model(model_path)

def load_and_preprocess_image(image):
    img_array = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
    img_array = cv2.resize(img_array, (128, 128)) 
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def generate_and_save_overlay(image, save_folder):
    try:
        visualization_models = [models.Model(inputs=model.inputs, outputs=layer.output) for layer in model.layers]

        target_layer = 4  

        if target_layer < len(visualization_models):
            feature_maps = visualization_models[target_layer].predict(image)

            if len(feature_maps.shape) == 4:
                heatmap = feature_maps[0, :, :, 0]
            else:
                raise ValueError(f"Unexpected feature_maps shape: {feature_maps.shape}")

            heatmap = (heatmap - np.min(heatmap)) / (np.max(heatmap) - np.min(heatmap) + 1e-8)

            heatmap_resized = cv2.resize(heatmap, (image.shape[2], image.shape[1]))

            threshold = 0.1
            dark_areas = heatmap_resized < threshold

            overlay_img = np.uint8(image[0].copy())
            overlay_img[~dark_areas, :] = [0, 0, 255]  
            
            username = request.form.get("Rn")
            user = collection.find_one({"registration_number": username})
            if user:
                predictionArrayLength = len(user["predictions"])

                filename = f"{username}{predictionArrayLength + 1}.jpg"

                overlay_image_path = os.path.join(save_folder, filename)
                cv2.imwrite(overlay_image_path, overlay_img)
                return overlay_image_path
            else:
                predictionArrayLength = 0

                filename = f"{username}{predictionArrayLength + 1}.jpg"

                overlay_image_path = os.path.join(save_folder, filename)
                cv2.imwrite(overlay_image_path, overlay_img)
                return overlay_image_path
        else:
            raise ValueError(f"Invalid target_layer index. Choose a value between 0 and {len(visualization_models) - 1}.")
    except Exception as e:
        print("Error generating and saving overlay image:", e)
        return None
    
@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image'].read()
    image = load_and_preprocess_image(file)
    user = request.form.get("Rn")
    print(user)
    try:
        overlay_image_path = generate_and_save_overlay(image, r'C:\Users\kasan\OneDrive\Desktop\Tyre\projectschool21\web\public\uploads')

        if overlay_image_path:

            with open(overlay_image_path, "rb") as img_file:
                overlay_image_bytes = img_file.read()


            overlay_image_base64 = base64.b64encode(overlay_image_bytes).decode('utf-8')
        else:
            return jsonify({'error': 'Failed to generate overlay image'}), 500


        prediction = model.predict(image)[0, 0]  
        
        predicted_class = 1 if prediction > 0.5 else 0

        class_labels = {1: "cracked", 0: "normal"}


        return jsonify({
            'predicted_class': class_labels[predicted_class],
            'prediction': float(prediction),
            'overlay_image': overlay_image_base64
        }), 200
    except Exception as e:
        print("Error during prediction:", e)
        return jsonify({'error': 'Failed to make prediction'}), 500

if __name__ == '__main__':
    app.run(debug=True)
