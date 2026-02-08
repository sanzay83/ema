import React, { useState, useRef } from "react";
import "./App.css";
import jsPDF from "jspdf";
import firstPageImage from "./firstpage.jpg"; // Ensure you have this image in your src folder

const App = () => {
  const [items, setItems] = useState([
    { location: "", comment: "", image: null },
    { location: "", comment: "", image: null },
    { location: "", comment: "", image: null },
  ]);

  const [projectNumber, setProjectNumber] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportNumber, setReportNumber] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [cell, setCell] = useState("");
  const [address, setAddress] = useState("");
  const [csZip, setcsZip] = useState("");
  const [division, setDivision] = useState("");
  const [additionalComment, setAdditionalComment] = useState("");
  const [firstPageText, setFirstPageText] = useState("");

  const formRef = useRef();

  const handleTextChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAdditionalCommentChange = (value) => {
    setAdditionalComment(value);
  };

  const handleImageUploadFromFile = (index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const targetSize = 600;

          canvas.width = targetSize;
          canvas.height = targetSize;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetSize, targetSize);

          const scale = Math.min(
            targetSize / img.width,
            targetSize / img.height
          );
          const newWidth = img.width * scale;
          const newHeight = img.height * scale;

          const x = (targetSize - newWidth) / 2;
          const y = (targetSize - newHeight) / 2;

          ctx.drawImage(img, x, y, newWidth, newHeight);

          const resizedDataURL = canvas.toDataURL("image/jpeg");
          const newItems = [...items];
          newItems[index].image = resizedDataURL;
          setItems(newItems);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const openImageInput = (index) => {
    document.getElementById(`file-input-${index}`).click();
  };

  const addNewItem = () => {
    setItems([...items, { location: "", comment: "", image: null }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectNumber || !reportDate || !reportNumber || !submittedBy) {
      alert("Please fill all required fields with *.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const boxWidth = pageWidth - margin * 2;

    const img = new Image();
    img.src = firstPageImage;

    img.onload = () => {
      // First page: full-page background image
      pdf.addImage(img, "JPEG", 0, 0, pageWidth, pageHeight);

      // Add centered "Test" text over the image
      pdf.setFontSize(40);
      pdf.setTextColor(255, 0, 0);
      pdf.setFont(undefined, "bold");
      pdf.text(firstPageText, pageWidth / 2, pageHeight / 2, {
        align: "center",
      });

      // Start new page for rest of the report
      pdf.addPage();

      // ========== Add content as usual from page 2 onward ==========

      const addHeader = () => {
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        pdf.text("EMA Project #:", 10, 15);
        pdf.rect(45, 10, 50, 8);
        pdf.text(projectNumber || "__________", 50, 15);

        pdf.text("Date:", 10, 25);
        pdf.rect(45, 20, 50, 8);
        pdf.text(reportDate || "__________", 50, 25);

        pdf.setFont(undefined, "bold");
        pdf.setTextColor(0, 125, 139);
        pdf.text("EMA Engineering & Consulting, Inc.", pageWidth - 10, 12, {
          align: "right",
        });

        pdf.setFont(undefined, "normal");
        pdf.setTextColor(0);
        pdf.text("Report #", pageWidth - 80, 25);
        pdf.rect(pageWidth - 60, 20, 50, 8);
        pdf.text(reportNumber || "__________", pageWidth - 55, 25);
      };

      const addIntroText = () => {
        pdf.setFont(undefined, "bold");
        pdf.setFontSize(18);
        pdf.setTextColor(0, 125, 139);
        pdf.text("Site Observation Report", pageWidth / 2, 40, {
          align: "center",
        });

        pdf.setFont(undefined, "normal");
        pdf.setTextColor(0);
        pdf.setFontSize(10);
        pdf.text(
          "EMA was on site to review general progress and evaluate where previously identified issues had been resolved.",
          margin,
          50,
          { maxWidth: boxWidth }
        );
        pdf.text("The following pictures show site conditions.", margin, 60, {
          maxWidth: boxWidth,
        });
        pdf.text(
          "Construction Manager/Contractor to review the following items observed not to be consistent with the plans, specifications and addenda for the above-named project. Please make the necessary corrections to these items and notify our office upon completion.",
          margin,
          70,
          { maxWidth: boxWidth }
        );
      };

      const addLastPageText = () => {
        pdf.rect(margin, 45, boxWidth, 75);
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        pdf.text("Additional Comments:", 10, 40);

        const commentLines = pdf.splitTextToSize(
          additionalComment || "",
          boxWidth - 8
        );
        pdf.text(commentLines, margin + 4, 50);

        pdf.setFont(undefined, "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 125, 139);
        pdf.text(submittedBy, 10, 135);

        pdf.setFontSize(10);
        pdf.setTextColor(0);
        const detailsText = `${jobTitle} \n${email}  \n${cell} \n\n${division}\n${address} \n${csZip}`;
        pdf.text(detailsText, 10, 145);
      };

      // Add header + intro on new page
      addHeader();
      addIntroText();

      let yOffset = 90;
      for (let i = 0; i < items.length; i++) {
        const boxTop = yOffset;

        pdf.setFontSize(10);
        pdf.setTextColor(0);
        const locationText = pdf.splitTextToSize(
          `Item #${i + 1} Location: ${items[i].location}`,
          boxWidth - 78
        );
        pdf.text(locationText, margin + 2, boxTop + 8);

        const commentBoxY = boxTop + 18;
        pdf.setFontSize(9);
        pdf.setTextColor(50);
        const commentLines = pdf.splitTextToSize(
          items[i].comment || "",
          boxWidth - 78
        );

        const dynamicCommentHeight = commentLines.length * 5 + 10;
        const commentBoxHeight = Math.max(dynamicCommentHeight, 50);
        pdf.setFillColor(230);
        pdf.rect(
          margin + 2,
          commentBoxY + 2,
          boxWidth - 70,
          commentBoxHeight - 25,
          "F"
        );

        pdf.text(commentLines, margin + 3, commentBoxY + 7);

        pdf.setFontSize(10);
        pdf.setTextColor(0);
        pdf.text("Comment:", margin + 2, boxTop + 18);

        if (items[i].image) {
          const imgWidth = 60;
          const imgHeight = 60;
          const imgX = boxWidth + margin - imgWidth - 2;
          const imgY = boxTop + 60 - imgHeight;
          pdf.addImage(items[i].image, "JPEG", imgX, imgY, imgWidth, imgHeight);
        }

        pdf.setDrawColor(150);
        pdf.rect(margin, boxTop, boxWidth, commentBoxHeight);
        yOffset += commentBoxHeight + 10;

        if (yOffset > 210) {
          pdf.addPage();
          addHeader();
          yOffset = 40;
        }
      }

      // Add final comments page
      pdf.addPage();
      addHeader();
      addLastPageText();

      // Save the PDF
      pdf.save(`EMA_P${projectNumber}_${reportDate}.pdf`);
    };
  };

  return (
    <div className="container" ref={formRef}>
      <div className="project-info">
        <div className="field">
          <label>*EMA Project #:</label>
          <input
            type="text"
            value={projectNumber}
            onChange={(e) => setProjectNumber(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>*Date:</label>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>*Report #:</label>
          <input
            type="text"
            value={reportNumber}
            onChange={(e) => setReportNumber(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="project-info">
        <div className="field">
          <label>*Submitted by:</label>
          <input
            type="text"
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Job Title:</label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Division:</label>
          <input
            type="text"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Email:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Cell:</label>
          <input
            type="text"
            value={cell}
            onChange={(e) => setCell(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Address:</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="field">
          <label>City, State & Zip Code:</label>
          <input
            type="text"
            value={csZip}
            onChange={(e) => setcsZip(e.target.value)}
          />
        </div>
        <div className="field">
          <label>*First Page Text:</label>
          <input
            type="text"
            value={firstPageText}
            onChange={(e) => setFirstPageText(e.target.value)}
            required
          />
        </div>
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          id={`item-${index}`}
          className="item-row"
          style={{
            pageBreakInside: "avoid",
            border: "1px solid #ccc",
            marginBottom: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            height: "350px",
          }}
        >
          <div className="text-box" style={{ flex: 1, marginRight: "20px" }}>
            <div className="field">
              <label>Item # {index + 1} Location:</label>
              <input
                type="text"
                value={item.location}
                onChange={(e) =>
                  handleTextChange(index, "location", e.target.value)
                }
              />
            </div>
            <div className="field">
              <label>Comment:</label>
              <textarea
                value={item.comment}
                onChange={(e) =>
                  handleTextChange(index, "comment", e.target.value)
                }
                style={{ resize: "none", height: "200px" }}
              />
            </div>
          </div>
          <div
            className="image-box"
            onClick={() => openImageInput(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              handleImageUploadFromFile(index, droppedFile);
            }}
            style={{
              flex: 1,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              border: "1px dashed #aaa",
              height: "100%",
              backgroundColor: "#f9f9f9",
            }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={`Uploaded ${index}`}
                style={{ maxHeight: "100%", maxWidth: "100%" }}
              />
            ) : (
              <span>Click or drag an image here</span>
            )}
            <input
              id={`file-input-${index}`}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) =>
                handleImageUploadFromFile(index, e.target.files[0])
              }
            />
          </div>
        </div>
      ))}
      <div
        className="text-box"
        style={{ flex: 1, marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="field">
          <label>Additional Comment:</label>
          <textarea
            value={additionalComment}
            onChange={(e) => handleAdditionalCommentChange(e.target.value)}
            style={{ resize: "none", height: "200px" }}
          />
        </div>
      </div>
      <div className="button-container">
        <button className="a-button add-button" onClick={addNewItem}>
          Add New Item
        </button>
      </div>
      <div className="button-container">
        <button className="a-button submit-button" onClick={handleSubmit}>
          Submit and Generate PDF
        </button>
      </div>
    </div>
  );
};

export default App;
