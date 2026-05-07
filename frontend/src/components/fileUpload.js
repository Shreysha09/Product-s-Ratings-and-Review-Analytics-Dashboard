import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { uploadFile } from '../services/api';
import { fetchAnalytics } from '../features/analyticsSlice';
import { fetchProducts } from '../features/productSlice';
import { fetchReviews } from '../features/reviewSlice';

const FileUpload = () => {
  const dispatch = useDispatch();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await uploadFile(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSuccess(`✅ Upload successful! Added ${response.data.productsCount} products and ${response.data.reviewsCount} reviews.`);
      
      // Refresh all data
      await Promise.all([
        dispatch(fetchAnalytics()),
        dispatch(fetchProducts({ page: 1, limit: 10 })),
        dispatch(fetchReviews({ page: 1, limit: 10 }))
      ]);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.response?.data?.error || 'Upload failed. Please check file format.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx', '.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        mb: 3,
        textAlign: 'center',
        cursor: 'pointer',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : error ? 'error.main' : success ? 'success.main' : 'grey.300',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: error ? 'error.main' : success ? 'success.main' : 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop the Excel/CSV file here' : 'Upload Product Reviews Data'}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Supported formats: .xlsx, .xls, .csv
      </Typography>
      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
        Required columns: product_id, product_name, category, actual_price, discounted_price, 
        discount_percentage, rating, rating_count, about_product, user_name, review_title, review_content
      </Typography>
      <Button 
        variant="contained" 
        disabled={uploading} 
        sx={{ mt: 2 }}
        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
      >
        {uploading ? 'Uploading...' : 'Select File'}
      </Button>
      
      {uploading && uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Processing... {uploadProgress}%
          </Typography>
        </Box>
      )}
      
      {uploadProgress === 100 && !uploading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CheckCircleIcon color="success" />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
    </Paper>
  );
};

export default FileUpload;