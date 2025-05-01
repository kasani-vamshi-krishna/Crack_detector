

// Udata.jsx
import React, { useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Image } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./udata.css";

function Udata() {
  const [data, setData] = useState([]);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [predictionSwitch, setPredictionSwitch] = useState(true);
  const [selectedPredictionIndex, setSelectedPredictionIndex] = useState(null);

  const handleSearch = () => {
    if (!registrationNumber) {
      console.error("Registration number is required");
      return;
    }

    axios
      .get(`http://localhost:8000/search?registrationNumber=${registrationNumber}`)
      .then((response) => {
        const result = response.data;

        if (result.length === 0) {
          console.log("No records found for registration number:", registrationNumber);
          setData([]);
        } else {
          console.log("Data from the server:", result);
          setData(result);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleImageClick = (imageName, predictionIndex) => {
    setSelectedImage(imageName);
    setShowImagePreview(true);
    setSelectedPredictionIndex(predictionIndex);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
    setSelectedImage(null);
    setSelectedPredictionIndex(null);
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };


	
	const handleSubmitFeedback = async () => {
  try {
    if (data.length === 0 || selectedPredictionIndex === null) {
      console.error("Invalid data or prediction index");
      return;
    }

    const response = await axios.post("http://localhost:8000/submitFeedback", {
      registrationNumber: data[0].registration_number,
      feedback: feedback,
      predictionQuality: predictionSwitch ? "Accurate" : "Not Accurate",
    });

    const result = response.data;

    if (response.status === 200) {
      console.log("Feedback submitted successfully:", result);
      toast.success("Feedback submitted successfully");
    } else {
      console.error("Error submitting feedback:", result.error);
      toast.error("Error submitting feedback");
    }

    // Reset the feedback field and close the modal
    setFeedback("");
    setShowImagePreview(false);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    toast.error("Error submitting feedback");
  }
};


  const handleSwitchChange = () => {
    setPredictionSwitch(!predictionSwitch);
  };

   return (
    <>
      <ToastContainer />
      <div className="App">
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />

        <h1>Registration App</h1>
        <label>
          Registration Number:
          <input
            type="text"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </label>
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Display user registration number above the table */}
      {data.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>User Registration Number: {data[0].registration_number}</strong>
        </div>
      )}

      {/* Display the records */}
      <div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Status</th>
              <th scope="col">Buttons</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="2">No records found</td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.predictions.length === 0 ? (
                      <div>No predictions available</div>
                    ) : (
                      item.predictions.map((prediction, predictionIndex) => (
                        <div key={predictionIndex} className="status-container">
                          Status: {prediction.label === "cracked" ? "Cracked" : "Normal"}
                          <div className="empty-line"></div>
                        </div>
                      ))
                    )}
                  </td>
                  <td>
                    {item.predictions.length === 0 ? (
                      <div>No predictions available</div>
                    ) : (
                      item.predictions.map((prediction, predictionIndex) => (
                        <div key={predictionIndex} className="buttons-container">
                          <Button
                            variant={prediction.label === "cracked" ? "danger" : "success"}
                            onClick={() => handleImageClick(prediction.imageName, predictionIndex)}
                          >
                            View Image {predictionIndex + 1}
                          </Button>
                          <div className="empty-button"></div>
                        </div>
                      ))
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Image Preview Modal */}
      <Modal show={showImagePreview} onHide={handleCloseImagePreview} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="image-preview-container">
            {selectedImage && (
              <Image src={`/uploads/${selectedImage}`} alt="Preview" fluid />
            )}
          </div>
          <Form.Group controlId="feedbackForm" className="feedback-form">
            <Form.Label>Feedback</Form.Label>
            <Form.Control as="textarea" rows={3} value={feedback} onChange={handleFeedbackChange} />
          </Form.Group>
          <div className="buttons-container">
            <Form.Group controlId="predictionSwitchForm">
              <Form.Check
                type="switch"
                label={predictionSwitch ? "Accurate" : "Not Accurate"}
                checked={predictionSwitch}
                onChange={handleSwitchChange}
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImagePreview}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitFeedback}>
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Udata;
