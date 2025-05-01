


// // Table.jsx
// import React, { useState, useEffect } from "react";
// import "./Table.css";
// import { Button, Modal } from "react-bootstrap";
// import * as xlsx from "xlsx";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'jspdf-autotable';
// import { jsPDF } from 'jspdf';
// import { useNavigate } from "react-router-dom";

// const Table = () => {
//   const [data, setData] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showDownloadModal, setShowDownloadModal] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("http://localhost:8000/getdata");
//         const result = await response.json();
//         setData(result);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleViewClick = (userName) => {
//     navigate(`/detail/${userName}`);
//   };

//   // Filtering data based on the search query and label "cracked"
//   // Filtering data based on the search query and label "cracked"
// const filteredData = data
// ? data.filter(
//     (item) =>
//       item.predictions.some(
//         (prediction) =>
//           prediction.label === "cracked" &&
//           (
//             (item.registration_number && item.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
//             (item.Phone_number && item.Phone_number.toLowerCase().includes(searchQuery.toLowerCase()))
//           )
//       )
//   )
// : [];


//   // Pagination logic
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   // Change page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handleDownloadPDF = () => {
//     setShowDownloadModal(false);
  
//     const pdf = new jsPDF();
  
//     filteredData.forEach((user) => {
//       pdf.addPage();
//       pdf.text(`User Name: ${user.registration_number}`, 10, 10);
//       pdf.text("Predictions:", 10, 20);
  
//       user.predictions.forEach((prediction, index) => {
//         const yPos = 30 + index * 10;
//         pdf.text(
//           `${index + 1}. Date: ${new Date(prediction.date).toLocaleString()}, Label: ${prediction.label}}`,
//           10,
//           yPos
//         );
//       });
  
//       if (user.predictions.length === 0) {
//         pdf.text("No predictions available.", 10, 30);
//       }
//     });
  
//     pdf.save(`user_details.pdf`);
//     showNotification('PDF downloaded successfully!');
//   };
  

//   const handleDownloadExcel = () => {
//     setShowDownloadModal(false);
  
//     const ws = xlsx.utils.book_new();
  
//     filteredData.forEach((user) => {
//       const userSheet = xlsx.utils.json_to_sheet([
//         { A: "User Name", B: user.registration_number },
//         { A: "Predictions", B: "" }, // Placeholder for the header
  
//         ...user.predictions.map((prediction, index) => ({
//           A: `${index + 1}. Date`,
//           B: new Date(prediction.date).toLocaleString(),
//           C: "Label",
//           D: prediction.label,
          
//         })),
  
//         // Add an empty row for better separation
//         { A: "", B: "" },
//       ]);
  
//       xlsx.utils.book_append_sheet(ws, userSheet, user.registration_number);
//     });
  
//     xlsx.writeFile(ws, `user_details.xlsx`);
//     showNotification('Excel downloaded successfully!');
//   };
  
//   const showNotification = (message) => {
//     toast.success(message, {
//       position: 'top-right',
//       autoClose: 3000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//     });
//   };

//   return (
//     <div className={`table-container`}>
//       <br/><br/><br/><br/>
//       <h1>Your MongoDB Data</h1>
//       <div>
//         <input
//           type="text"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <div className="download-options">
//           <Button variant="primary" onClick={() => setShowDownloadModal(true)}>
//             Download All
//           </Button>
//         </div>
//         <table className="table">
//           <thead>
//             <tr>
//               <th scope="col">#</th>
//               <th scope="col">User Name</th>
//               <th scope="col">Last Updated Time</th>
//               <th scope="col">View</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentItems.map((item, index) => (
//               <tr key={item._id}>
//                 <th scope="row">{indexOfFirstItem + index + 1}</th>
//                 <td>{item.registration_number}</td>
//                 <td>{new Date(item.predictions[item.predictions.length - 1].date).toLocaleString()}</td>
//                 <td>
//                   <button onClick={() => handleViewClick(item.registration_number)}>View</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div>
//           <ul className="pagination">
//             {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
//               <li key={index} onClick={() => paginate(index + 1)}>
//                 <a href="#!">{index + 1}</a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Download Modal */}
//       <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Download User Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Button variant="primary" onClick={handleDownloadExcel}>
//             Download as Excel
//           </Button>
//           <Button variant="primary" onClick={handleDownloadPDF}>
//             Download as PDF
//           </Button>
//         </Modal.Body>
//       </Modal>

//       <ToastContainer />
//     </div>
//   );
// };

// export default Table;


// Table.jsx
import React, { useState, useEffect } from "react";
import "./Table.css";
import { Button, Modal } from "react-bootstrap";
import * as xlsx from "xlsx";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import { useNavigate } from "react-router-dom";

const Table = () => {
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/getdata");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleViewClick = (userName) => {
    navigate(`/detail/${userName}`);
  };

  // Filtering data based on the search query and label "cracked"
  const filteredData = data
    ? data.filter(
        (item) =>
          item.predictions &&
          item.predictions.some(
            (prediction) =>
              prediction.label === "cracked" &&
              (
                (item.registration_number && item.registration_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.Phone_number && item.Phone_number.toLowerCase().includes(searchQuery.toLowerCase()))
              )
          )
      )
    : [];

  // Pagination logic
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDownloadPDF = () => {
    setShowDownloadModal(false);

    const pdf = new jsPDF();

    filteredData.forEach((user) => {
      pdf.addPage();
      pdf.text(`User Name: ${user.registration_number}`, 10, 10);
      pdf.text("Predictions:", 10, 20);

      user.predictions.forEach((prediction, index) => {
        const yPos = 30 + index * 10;
        pdf.text(
          `${index + 1}. Date: ${new Date(prediction.date).toLocaleString()}, Label: ${prediction.label}`,
          10,
          yPos
        );
      });

      if (user.predictions.length === 0) {
        pdf.text("No predictions available.", 10, 30);
      }
    });

    pdf.save(`user_details.pdf`);
    showNotification('PDF downloaded successfully!');
  };

  const handleDownloadExcel = () => {
    setShowDownloadModal(false);

    const ws = xlsx.utils.book_new();

    filteredData.forEach((user) => {
      const userSheet = xlsx.utils.json_to_sheet([
        { A: "User Name", B: user.registration_number },
        { A: "Predictions", B: "" }, // Placeholder for the header

        ...user.predictions.map((prediction, index) => ({
          A: `${index + 1}. Date`,
          B: new Date(prediction.date).toLocaleString(),
          C: "Label",
          D: prediction.label,
        })),

        // Add an empty row for better separation
        { A: "", B: "" },
      ]);

      xlsx.utils.book_append_sheet(ws, userSheet, user.registration_number);
    });

    xlsx.writeFile(ws, `user_details.xlsx`);
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
    <div className={`table-container`}>
      <br /><br /><br /><br />
      <h1>Your MongoDB Data</h1>
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="download-options">
          <Button variant="primary" onClick={() => setShowDownloadModal(true)}>
            Download All
          </Button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">User Name</th>
              <th scope="col">Last Updated Time</th>
              <th scope="col">View</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="4">No data available matching the search criteria.</td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item._id}>
                  <th scope="row">{indexOfFirstItem + index + 1}</th>
                  <td>{item.registration_number}</td>
                  <td>{new Date(item.predictions[item.predictions.length - 1].date).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleViewClick(item.registration_number)}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div>
          <ul className="pagination">
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, index) => (
              <li key={index} onClick={() => paginate(index + 1)}>
                <a href="#!">{index + 1}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Download Modal */}
      <Modal show={showDownloadModal} onHide={() => setShowDownloadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Download User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant="primary" onClick={handleDownloadExcel}>
            Download as Excel
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            Download as PDF
          </Button>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Table;
