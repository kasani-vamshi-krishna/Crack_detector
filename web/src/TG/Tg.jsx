



import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Tg.css";
import LoadingSpinner from "./LoadingSpinner";

const Tg = () => {
  const [Pn, setPn] = useState("");
  const [Rn, setRn] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();

    if (!Pn || !Rn) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!image) {
      toast.error("Please select an image to upload");
      return;
    }


    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("Pn", Pn);
    formData.append("Rn", Rn);
    formData.append("predicted_class", ""); 
    formData.append("prediction", "");

    try {
      // Send data to Flask first
      const flaskResponse = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );


      const { predicted_class, prediction } = flaskResponse.data;


      formData.set("predicted_class", predicted_class);
      formData.set("prediction", prediction);


      const uploadResponse = await axios.post(
        "http://localhost:8000/uploads",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );


      toast.success("Data uploaded successfully");


      console.log("Response from server:", uploadResponse.data);


      setPn("");
      setRn("");
      setImage(null);
    } catch (error) {
      console.error("Error uploading data:", error);


      toast.error(
        `Error uploading data: ${
          error.response ? error.response.data.error : "Unknown error"
        }`
      );
    } finally {

      setLoading(false);
    }
  };

  const PnumUpdate = (e) => {
    const input = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setPn(input);
  };

  const RnumUpdate = (e) => {
    const input = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setRn(input);
  };

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];
    setImage(selectedImage);
  };

  return (
    <div className="hero">
      <div className="card1">
        <form onSubmit={submitForm}>
          <input
            type="text"
            placeholder="Enter reg number"
            id="reg-no"
            className="form-control"
            value={Rn}
            onChange={RnumUpdate}
            name="regNumber"
          />
          <input
            type="text"
            placeholder="Enter phone number"
            id="ph-no"
            className="form-control"
            value={Pn}
            onChange={PnumUpdate}
            name="phoneNumber"
          />

          <div className="file-input">
            <label htmlFor="input-file" className="file-label">
              Choose File
            </label>
            <div className="selected-file-box">
              {image && <span>{image.name}</span>}
            </div>
            <input
              type="file"
              id="input-file"
              onChange={handleImageChange}
              style={{ display: "none" }}
              accept="image/*" 
              name="image"
            />
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            image && (
              <button type="submit" id="btn">
                Submit
              </button>
            )
          )}
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Tg;



