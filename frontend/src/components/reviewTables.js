import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  Search as SearchIcon, 
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import { fetchReviews, setCurrentPage, setFilters, resetFilters } from '../features/reviewSlice';

// Helper function to safely get rating
const getSafeRating = (rating) => {
  const num = parseFloat(rating);
  return isNaN(num) ? 0 : num;
};

const ReviewsTable = () => {
  const dispatch = useDispatch();
  const { items, total, currentPage, loading, error, filters } = useSelector(
    (state) => state.reviews
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [localSearch, setLocalSearch] = React.useState(filters.search);

  useEffect(() => {
    dispatch(
      fetchReviews({
        page: currentPage,
        limit: rowsPerPage,
        ...filters,
      })
    );
  }, [dispatch, currentPage, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    dispatch(setCurrentPage(newPage + 1));
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    dispatch(setCurrentPage(1));
  };

  const handleSearch = () => {
    dispatch(setFilters({ search: localSearch }));
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    dispatch(setFilters({ search: '' }));
  };

  const handleRatingChange = (event) => {
    dispatch(setFilters({ rating: event.target.value }));
  };

  const handleReset = () => {
    setLocalSearch('');
    dispatch(resetFilters());
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Customer Reviews</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => dispatch(fetchReviews({ page: currentPage, limit: rowsPerPage, ...filters }))}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={7}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Search Reviews"
              variant="outlined"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              size="small"
              placeholder="Search by review title, content, or reviewer name..."
              InputProps={{
                endAdornment: localSearch && (
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                ),
              }}
            />
            <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />}>
              Search
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Filter by Rating</InputLabel>
            <Select
              value={filters.rating}
              label="Filter by Rating"
              onChange={handleRatingChange}
            >
              <MenuItem value="">All Ratings</MenuItem>
              <MenuItem value="5">5 Stars ⭐⭐⭐⭐⭐</MenuItem>
              <MenuItem value="4">4 Stars ⭐⭐⭐⭐</MenuItem>
              <MenuItem value="3">3 Stars ⭐⭐⭐</MenuItem>
              <MenuItem value="2">2 Stars ⭐⭐</MenuItem>
              <MenuItem value="1">1 Star ⭐</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button fullWidth variant="outlined" onClick={handleReset}>
            Reset Filters
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Product</strong></TableCell>
                  <TableCell><strong>Reviewer</strong></TableCell>
                  <TableCell align="center"><strong>Rating</strong></TableCell>
                  <TableCell><strong>Review</strong></TableCell>
                  <TableCell align="center"><strong>Helpful</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography py={3}>No reviews found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((review) => {
                    const rating = getSafeRating(review.rating);
                    const helpfulCount = parseInt(review.helpful_count) || 0;
                    
                    return (
                      <TableRow key={review.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {review.product_name || 'N/A'}
                          </Typography>
                          {review.category && (
                            <Chip label={review.category} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{review.user_name || 'Anonymous'}</Typography>
                          {review.rating_count > 0 && (
                            <Typography variant="caption" color="textSecondary">
                              Based on {parseInt(review.rating_count).toLocaleString()} ratings
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Rating value={rating} readOnly size="medium" />
                          <Typography variant="caption" display="block">
                            {rating.toFixed(1)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Accordion sx={{ boxShadow: 'none', border: 'none' }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {review.review_title || 'Review'}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" color="textSecondary">
                                {review.review_content || 'No review content provided.'}
                              </Typography>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            icon={<ThumbUpIcon sx={{ fontSize: 14 }} />}
                            label={`${helpfulCount} helpful`} 
                            size="small" 
                            color={helpfulCount > 10 ? "success" : "default"}
                            variant={helpfulCount > 10 ? "filled" : "outlined"}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total || 0}
            rowsPerPage={rowsPerPage}
            page={currentPage - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default ReviewsTable;