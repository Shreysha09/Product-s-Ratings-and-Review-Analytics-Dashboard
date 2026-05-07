import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import FileUpload from './components/fileUpload';
import ProductsTable from './components/productTable';
import ReviewsTable from './components/reviewTables';
import {
  ProductsPerCategoryChart, TopReviewedProductsChart,
  DiscountDistributionChart,
  CategoryWiseRatingChart,
  StatsCards,
} from './components/chart';
import { fetchAnalytics } from './features/analyticsSlice';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const {
    productsPerCategory,
    topReviewedProducts,
    discountDistribution,
    categoryWiseRating,
    productStats,
    loading,
    error
  } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            📊 Product Ratings & Review Analytics Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <FileUpload />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Error loading analytics: {error}
          </Alert>
        ) : (
          <>
            <StatsCards stats={productStats} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Analytics Overview
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flex: '1 1 calc(50% - 24px)', minWidth: '300px' }}>
                <ProductsPerCategoryChart data={productsPerCategory} />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 24px)', minWidth: '300px' }}>
                <TopReviewedProductsChart data={topReviewedProducts} />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 24px)', minWidth: '300px' }}>
                <DiscountDistributionChart data={discountDistribution} />
              </Box>
              <Box sx={{ flex: '1 1 calc(50% - 24px)', minWidth: '300px' }}>
                <CategoryWiseRatingChart data={categoryWiseRating} />
              </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', borderRadius: 1 }}>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2 }}>
                <Tab label="📦 Products" />
                <Tab label="⭐ Reviews" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <ProductsTable />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ReviewsTable />
            </TabPanel>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;