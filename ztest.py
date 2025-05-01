import requests
import base64

# Define the predict URL
PREDICT_URL = "http://127.0.0.1:5000/predict"  # Change to your server URL if different

# Path to the image file to send
IMAGE_PATH = r"C:\Users\kasan\OneDrive\Pictures\Screenshots\Screenshot 2024-11-29 172227.png"

# User's registration number (example)
registration_number = "123456"

try:
    # Read the image file in binary mode
    with open(IMAGE_PATH, "rb") as image_file:
        # Prepare the request payload
        files = {
            'image': image_file
        }
        data = {
            'Rn': registration_number
        }

        # Send the POST request
        response = requests.post(PREDICT_URL, files=files, data=data)

        # Process the response
        if response.status_code == 200:
            response_data = response.json()

            # Decode and save the overlay image if it exists
            overlay_image_base64 = response_data.get('overlay_image')
            if overlay_image_base64:
                overlay_image_bytes = base64.b64decode(overlay_image_base64)
                with open("overlay_image.jpg", "wb") as overlay_file:
                    overlay_file.write(overlay_image_bytes)
                print("Overlay image saved as 'overlay_image.jpg'")

            # Display prediction details
            print("Prediction:", response_data.get('predicted_class'))
            print("Confidence:", response_data.get('prediction'))
        else:
            print("Error:", response.status_code, response.text)
except Exception as e:
    print("An error occurred:", e)
