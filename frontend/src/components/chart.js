
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Paper, Typography, Grid, Box, Chip, Rating } from '@mui/material';
import { TrendingUp, Star, Category, LocalOffer } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, bgcolor: 'white' }}>
        <Typography variant="body2">{`${label}: ${payload[0].value}`}</Typography>
      </Paper>
    );
  }
  return null;
};


export const ProductsPerCategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Category sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">Products per Category</Typography>
      </Box>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category_clean" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#8884d8" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};





export const TopReviewedProductsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  // Function to truncate product names
  const truncateProductName = (name, maxLength = 30) => {
    if (!name) return 'N/A';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Safely parse numeric values
  const parseSafeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Prepare data with truncated names and ensure all values are numbers
  const chartData = data.map(item => {
    // Safely parse all numeric fields
    const reviewCount = parseSafeNumber(item.review_count, 0);
    const avgRating = parseSafeNumber(item.avg_rating, 0);
    const discountedPrice = parseSafeNumber(item.discounted_price, 0);
    const discountPercentage = parseSafeNumber(item.discount_percentage, 0);

    return {
      ...item,
      original_name: item.product_name,
      product_name: truncateProductName(item.product_name, 30),
      review_count: reviewCount,
      avg_rating: avgRating,
      discounted_price: discountedPrice,
      discount_percentage: discountPercentage
    };
  }).sort((a, b) => b.review_count - a.review_count);

  return (
    <Paper sx={{ p: 2, height: 450 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Star sx={{ mr: 1, color: 'warning.main' }} />
        <Typography variant="h6">Top Reviewed Products</Typography>
        <Chip
          label={`${chartData.length} products`}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 130, bottom: 20 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            label={{
              value: 'Number of Reviews',
              position: 'insideBottom',
              offset: -5,
              style: { fill: '#666', fontSize: 12 }
            }}
          />
          <YAxis
            type="category"
            dataKey="product_name"
            width={130}
            tick={{ fontSize: 11, fill: '#555' }}
            interval={0}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(130, 202, 157, 0.1)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                // Safely format numbers for display
                const formatNumber = (value) => {
                  const num = parseFloat(value);
                  return isNaN(num) ? 0 : num;
                };

                return (
                  <Paper sx={{ p: 2, bgcolor: 'white', boxShadow: 3, minWidth: 250, maxWidth: 350 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      {data.original_name || data.product_name}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">Total Reviews:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatNumber(data.review_count).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">Average Rating:</Typography>
                        <Box display="flex" alignItems="center">
                          <Rating value={formatNumber(data.avg_rating)} readOnly size="small" precision={0.5} />
                          <Typography variant="body2" fontWeight="bold" sx={{ ml: 1 }}>
                            {formatNumber(data.avg_rating).toFixed(1)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="textSecondary">Discount:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {Math.round(formatNumber(data.discount_percentage))}%
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Price:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ₹{formatNumber(data.discounted_price).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="review_count"
            fill="#82ca9d"
            radius={[0, 8, 8, 0]}
            label={{
              position: 'right',
              formatter: (value) => {
                const num = parseFloat(value);
                return isNaN(num) ? '0' : num.toLocaleString();
              },
              fontSize: 11,
              fill: '#666'
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const DiscountDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  // Sort data by discount range order
  const rangeOrder = ['0%', '1-10%', '11-20%', '21-30%', '31-40%', '41-50%', '51-60%', '61-70%', '71-80%', '80%+'];
  const sortedData = [...data].sort((a, b) => {
    return rangeOrder.indexOf(a.discount_range) - rangeOrder.indexOf(b.discount_range);
  });

  return (
    <Paper sx={{ p: 2, height: 500 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <LocalOffer sx={{ mr: 1, color: 'error.main' }} />
        <Typography variant="h6">Discount Distribution</Typography>
      </Box>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart 
          data={sortedData} 
          layout="vertical"
          margin={{ top: 20, right: 80, left: 80, bottom: 20 }}
          barSize={35}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} />
          <XAxis 
            type="number" 
            label={{ value: 'Number of Products', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category" 
            dataKey="discount_range" 
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name, props) => {
              return [value, 'Number of Products'];
            }}
            labelFormatter={(label) => `Discount: ${label}`}
          />
          <Bar 
            dataKey="count" 
            fill="#ff8042" 
            radius={[0, 8, 8, 0]}
            label={{ 
              position: 'right', 
              formatter: (value) => value,
              fontSize: 12,
              fill: '#666'
            }}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const CategoryWiseRatingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">No data available</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: 400 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
        <Typography variant="h6">Category-wise Average Rating</Typography>
      </Box>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis domain={[0, 5]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avg_rating" fill="#ffc658" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const StatsCards = ({ stats }) => {
  if (!stats) return null;

  // Helper function to safely format numbers
  const formatNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return defaultValue;
    }
    return value;
  };

  // Safely parse numeric values
  const totalProducts = formatNumber(stats.total_products);
  const totalReviews = formatNumber(stats.total_reviews);
  const overallAvgRating = formatNumber(stats.overall_avg_rating);
  const avgDiscount = formatNumber(stats.avg_discount);
  const positiveReviews = formatNumber(stats.positive_reviews);
  const negativeReviews = formatNumber(stats.negative_reviews);
  const maxDiscount = formatNumber(stats.max_discount);
  const minDiscount = formatNumber(stats.min_discount);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
          <Typography variant="h4" color="primary" fontWeight="bold">
            {totalProducts.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">Total Products</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
          <Typography variant="h4" color="secondary" fontWeight="bold">
            {totalReviews.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="textSecondary">Total Reviews</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
          <Typography variant="h4" color="warning.main" fontWeight="bold">
            {typeof overallAvgRating === 'number' && !isNaN(overallAvgRating)
              ? overallAvgRating.toFixed(1)
              : '0.0'}
          </Typography>
          <Typography variant="body2" color="textSecondary">Average Rating</Typography>
          <Box sx={{ mt: 1 }}>
            <Rating
              value={typeof overallAvgRating === 'number' && !isNaN(overallAvgRating) ? overallAvgRating : 0}
              readOnly
              size="small"
              precision={0.5}
            />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, textAlign: 'center', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 } }}>
          <Typography variant="h4" color="success.main" fontWeight="bold">
            {typeof avgDiscount === 'number' && !isNaN(avgDiscount)
              ? `${Math.round(avgDiscount)}%`
              : '0%'}
          </Typography>
          <Typography variant="body2" color="textSecondary">Average Discount</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};