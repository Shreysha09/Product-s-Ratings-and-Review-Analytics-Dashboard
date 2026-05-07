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
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { fetchProducts, setCurrentPage, setFilters, resetFilters } from '../features/productSlice';

// Helper function to safely format currency
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0.00';
  }
  const num = parseFloat(value);
  return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
};

// Helper function to safely format number
const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  const num = parseFloat(value);
  return isNaN(num) ? '0' : num.toFixed(0);
};

// Helper function to safely get discount percentage
const getDiscountPercentage = (product) => {
  if (product.discount_percentage && !isNaN(parseFloat(product.discount_percentage))) {
    return Math.round(parseFloat(product.discount_percentage));
  }
  // Calculate discount if not provided
  if (product.actual_price && product.discounted_price) {
    const actual = parseFloat(product.actual_price);
    const discounted = parseFloat(product.discounted_price);
    if (!isNaN(actual) && !isNaN(discounted) && actual > 0) {
      return Math.round(((actual - discounted) / actual) * 100);
    }
  }
  return 0;
};

// Helper function to safely get rating
const getSafeRating = (rating) => {
  const num = parseFloat(rating);
  return isNaN(num) ? 0 : num;
};

const ProductsTable = () => {
  const dispatch = useDispatch();
  const { items, total, currentPage, loading, error, filters } = useSelector(
    (state) => state.products
  );
  const { categories } = useSelector((state) => state.analytics);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [localSearch, setLocalSearch] = React.useState(filters.search);

  useEffect(() => {
    dispatch(
      fetchProducts({
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

  const handleCategoryChange = (event) => {
    dispatch(setFilters({ category: event.target.value }));
  };

  const handleRatingChange = (event) => {
    dispatch(setFilters({ minRating: event.target.value }));
  };

  const handleReset = () => {
    setLocalSearch('');
    dispatch(resetFilters());
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => dispatch(fetchProducts({ page: 1, limit: rowsPerPage, ...filters }))}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Products</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => dispatch(fetchProducts({ page: currentPage, limit: rowsPerPage, ...filters }))}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              size="small"
              placeholder="Search by product name..."
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
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories && categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Minimum Rating</InputLabel>
            <Select
              value={filters.minRating}
              label="Minimum Rating"
              onChange={handleRatingChange}
            >
              <MenuItem value="">Any Rating</MenuItem>
              <MenuItem value="4">4 Stars & Above</MenuItem>
              <MenuItem value="3">3 Stars & Above</MenuItem>
              <MenuItem value="2">2 Stars & Above</MenuItem>
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
                  <TableCell><strong>Product Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Original Price</strong></TableCell>
                  <TableCell align="right"><strong>Discounted Price</strong></TableCell>
                  <TableCell align="center"><strong>Discount</strong></TableCell>
                  <TableCell align="center"><strong>Rating</strong></TableCell>
                  <TableCell align="center"><strong>Reviews</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography py={3}>No products found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((product) => {
                    // Safely parse product data
                    const actualPrice = parseFloat(product.actual_price) || 0;
                    const discountedPrice = parseFloat(product.discounted_price) || actualPrice;
                    const discount = getDiscountPercentage(product);
                    const avgRating = getSafeRating(product.avg_rating);
                    const reviewCount = parseInt(product.review_count) || 0;
                    
                    return (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {product.product_name || 'N/A'}
                          </Typography>
                          {product.about_product && (
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>
                              {product.about_product.substring(0, 80)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={product.category || 'Uncategorized'} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                            {formatCurrency(actualPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(discountedPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {discount > 0 ? (
                            <Chip 
                              label={`${discount}% OFF`} 
                              size="small" 
                              color="error" 
                            />
                          ) : (
                            <Chip label="0%" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
                            <Rating
                              value={avgRating}
                              readOnly
                              precision={0.5}
                              size="small"
                            />
                            <Typography variant="caption" sx={{ mt: 0.5 }}>
                              ({avgRating.toFixed(1)})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={reviewCount.toLocaleString()} 
                            size="small" 
                            color={reviewCount > 100 ? "success" : "default"}
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

export default ProductsTable;