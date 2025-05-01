import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import * as xlsx from "xlsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./DetailView.css";

const DetailView = () => {
  const { registrationNumber } = useParams();
  const [userData, setUserData] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/getdata/${registrationNumber}`);
        const result = await response.json();
        setUserData(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [registrationNumber]);

  const handleImageClick = (imageName) => {
    const selectedPrediction = userData?.[0]?.predictions.find((prediction) => prediction.imageName === imageName);
    if (selectedPrediction) {
      setSelectedImage(selectedPrediction.imageName);
      setShowImagePreview(true);
    }
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
    setSelectedImage(null);
  };

  const handleDownloadPDF = () => {
    console.log("executed");
    if (!userData) {
      console.log("User data is not available yet");
      return;
    }

    const scripts = document.createElement('script');
    scripts.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js';
    scripts.async = true;
    document.head.appendChild(scripts);

    scripts.onload = () => {
      const autotableScript = document.createElement('script');
      autotableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js';
      autotableScript.async = true;
      document.head.appendChild(autotableScript);

      autotableScript.onload = () => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.autoTable({
          head: [["Date", "Image Name", "Label"]],
          body: userData[0].predictions
            .filter((prediction) => prediction.label === "cracked")
            .map((prediction) => [
              new Date(prediction.date).toLocaleString(),
              prediction.imageName,
              prediction.label,
            ]),
        });

        pdf.save(`user_details_${registrationNumber}.pdf`);
        showNotification('PDF downloaded successfully!');
      };
    };
  };

  const handleDownloadExcel = () => {
    console.log("executed");
    if (!userData) {
      console.log("User data is not available yet");
      return;
    }

    const ws = xlsx.utils.json_to_sheet(userData[0].predictions);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Predictions");

    xlsx.writeFile(wb, `user_details_${registrationNumber}.xlsx`);
    showNotification('Excel downloaded successfully!');
  };

  const showNotification = (message) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="container">
      <br/><br/><br/><br/><br/>
      <h1>User Details</h1>
      {userData && (
        <div className="user-details">
          <p>Registration Number: {userData[0].registration_number}</p>
          <p>Phone Number: {userData[0].Phone_number}</p>
        </div>
      )}

      <h2>Predictions</h2>
      {userData && userData[0]?.predictions.some(prediction => prediction.label === "cracked") ? (
        <div id="pdf-content">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Image Name</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {userData[0].predictions.map((prediction, index) => (
                prediction.label === "cracked" && (
                  <tr key={index}>
                    <td>{new Date(prediction.date).toLocaleString()}</td>
                    <td>
                      <span
                        className="image-name"
                        onClick={() => handleImageClick(prediction.imageName)}
                      >
                        {prediction.imageName}
                      </span>
                    </td>
                    <td>{prediction.label}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No cracked predictions available.</p>
      )}
      <br/><br/>
      <Button variant="primary" onClick={handleDownloadExcel}>
        Download as Excel
      </Button>
      <br/><br/>
      <Button variant="primary" onClick={handleDownloadPDF}>
        Download as PDF
      </Button>

      <Modal show={showImagePreview} onHide={handleCloseImagePreview} centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="image-preview-container">
            {selectedImage && (
              <img
                src={`/uploads/${selectedImage}`}
                alt="Preview"
                className="image-preview"
              />
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImagePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default DetailView;
