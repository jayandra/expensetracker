import { Container } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Link } from 'react-router-dom';
import Button from '../components/Form/Button';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Layout from './Layout';
import WrapperTile from '../components/WrapperTile';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white rounded-xl p-6 h-full flex flex-col">
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-center mb-2">
      {title}
    </h3>
    <p className="text-gray-600 text-sm text-center mt-auto">
      {description}
    </p>
  </div>
);

const ScreenshotCard = ({ title, description, imageUrl }: { title: string, description: string, imageUrl: string }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm h-full">
    <h3 className="text-lg font-semibold mb-2">
      {title}
    </h3>
    <img 
      src={imageUrl} 
      alt={title} 
      className="w-full h-auto rounded-lg mb-4"
    />
    <p className="text-gray-600 text-sm">
      {description}
    </p>
  </div>
);

const HomePage = () => {
  return (
    <Layout>
      <WrapperTile className="mb-8">
        <Container maxWidth="lg" sx={{ textAlign: 'center', py: 4 }}>
          <h1 className="text-3xl font-bold mb-4">
            Track Your Expenses with Ease
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Take control of your finances with our intuitive expense tracking application. 
            Monitor your spending, categorize expenses, and gain insights into your financial habits.
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/react/login">
              <Button 
                variant="primary"
                className="px-6 py-3 text-base"
              >
                <LoginIcon className="mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/react/signup">
              <Button 
                variant="outline"
                className="px-6 py-3 text-base"
              >
                <AppRegistrationIcon className="mr-2" />
                Create Account
              </Button>
            </Link>
          </div>
        </Container>
      </WrapperTile>

      {/* Features Section */}
      <WrapperTile className="mb-8">
        <Container maxWidth="lg">
          <h2 className="text-2xl font-bold text-center mb-8">Powerful Features</h2>
          <Grid container spacing={3}>
            {/* First Row */}
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FeatureCard
                icon={<ReceiptIcon color="primary" sx={{ fontSize: 48 }} />}
                title="Expense Tracking"
                description="Easily record and categorize your daily expenses with just a few taps."
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FeatureCard
                icon={<PieChartIcon color="primary" sx={{ fontSize: 48 }} />}
                title="Categories"
                description="Organize your expenses with custom categories for better insights."
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FeatureCard
                icon={<TimelineIcon color="primary" sx={{ fontSize: 48 }} />}
                title="Visual Reports"
                description="Get clear visualizations of your spending patterns and financial health."
              />
            </Grid>
            <Grid size={{ xs:12, sm:6, md:3 }}>
              <FeatureCard
                icon={<SecurityIcon color="primary" sx={{ fontSize: 48 }} />}
                title="Secure & Private"
                description="Your financial data is encrypted and stays private. We never sell your information."
              />
            </Grid>
          </Grid>
        </Container>
      </WrapperTile>

      {/* How It Works Section */}
      <WrapperTile className="mb-8">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <h2 className="text-2xl font-bold text-center mb-8">
            How It Works
          </h2>
          <Grid container spacing={4}>
            <Grid size={{ sm:12, md:6 }}>
              <ScreenshotCard
                title="1. Manage Categories"
                description="Create and customize categories to organize your expenses exactly how you want."
                imageUrl="../../../public/images/categories.png"
              />
            </Grid>
            <Grid size={{ sm: 12, md: 6 }}>
              <ScreenshotCard
                title="2. Manage Expenses"
                description="Create and categorize expenses by entering the amount, date and (or) a note."
                imageUrl="../../../public/images/expenses.png"
              />
            </Grid>
            <Grid size={{ sm:12, md:6 }}>
              <ScreenshotCard
                title="3. View Your Dashboard"
                description="See your spending patterns at a glance with our intuitive dashboard and charts."
                imageUrl="../../../public/images/dashboard.png"
              />
            </Grid>

          </Grid>
        </Container>
      </WrapperTile>

      {/* Test Credentials Section */}
      <WrapperTile>
        <Container maxWidth="md">
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Want to Try It Out?
            </h3>
            <p className="text-gray-700 mb-6 text-left">
                Use these test credentials to explore the app with sample data.
                Any categories or expenses created/edited/deleted will not be saved and ignored silently.
                <br /><br />
                So, please feel free to try out anything as it won't affect any data associated with the test account.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
              <p className="text-sm"><span className="font-medium">Email:</span> demo_user@example.com</p>
              <p className="text-sm"><span className="font-medium">Password:</span> password123</p>
            </div>
            <div className="flex justify-center">
              <Link to="/react/login" className="inline-block">
                <Button 
                  variant="primary"
                  className="px-6 py-2 text-base w-48"
                >
                  <LoginIcon className="mr-2" />
                  Sign In with Test Account
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </WrapperTile>
    </Layout>
  );
};

export default HomePage;
