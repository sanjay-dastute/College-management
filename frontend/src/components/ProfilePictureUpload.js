import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-toastify';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = ({ studentId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { api } = useApi();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Only JPEG, PNG, and GIF files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_pic', selectedFile);

      const response = await api.post(
        `/api/students/${studentId}/upload_profile_pic/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Profile picture uploaded successfully');
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(response.data.profile_pic_url);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-picture-upload">
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`upload-button ${uploading ? 'uploading' : ''}`}
      >
        {uploading ? 'Uploading...' : 'Upload Profile Picture'}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;
