// UploadDocument.js
import React, { useState, useRef } from 'react';
import './Style/UploadDocument.css';

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    console.log('Nom du fichier sélectionné :', file.name);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra :', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };
  const generateRandomWord = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomWord = '';
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomWord += characters.charAt(randomIndex);
    }
    return randomWord;
  };
  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
  
      // Convertir l'image du canvas en blob
      canvas.toBlob((blob) => {
        const randomWord = generateRandomWord();
        const fileName = `scanned-image-${randomWord}.png`;
        
        const formData = new FormData();
        formData.append('file', blob, fileName);
  
        // Envoyer le blob au backend (à adapter selon votre backend)
        fetch('http://localhost:8080/File/upload', {
          method: 'POST',
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log('Réponse du backend :', data))
          .catch((error) => console.error('Erreur lors de l\'envoi du fichier :', error));
      }, 'image/png');
      setIsProcessing(true);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        setIsProcessing(true);

        const response = await fetch('http://localhost:8080/File/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Réponse du backend :', data);
        } else {
          console.error('Erreur lors de l\'envoi du fichier :', response.statusText);
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du fichierhhh :', error.message);
      } 
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-title">Mon Application</div>
      </nav>

      <div className="upload-document-container">
        <h1>Bienvenue sur Mon Application</h1>
        <h2 className="upload-document-title">Télécharger le Document CIN</h2>
        <form onSubmit={onSubmit}>
          <input
            type="file"
            onChange={onFileChange}
            accept=".pdf, .jpg, .png"
            className="file-input"
            required
          />
          <button type="button" onClick={isCameraActive ? stopCamera : startCamera} className="camera-button">
            {isCameraActive ? 'Désactiver la caméra' : 'Activer la caméra'}
          </button>
          <button type="button" onClick={takeSnapshot} className="camera-button" disabled={!isCameraActive}>
            Prendre une photo
          </button>
          <button type="submit" className="upload-button" disabled={isProcessing}>
            {isProcessing ? 'En cours de traitement...' : 'Télécharger'}
          </button>
          {isProcessing && <p>Le document est en cours de traitement. Veuillez patienter...</p>}
        </form>
        <video ref={videoRef} style={{ display: isCameraActive ? 'block' : 'none' }} autoPlay />
      </div>
    </div>
  );
};

export default UploadDocument;
