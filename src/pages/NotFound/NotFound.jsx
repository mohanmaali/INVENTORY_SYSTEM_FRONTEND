import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Button, Card } from '../../components/ui';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="text-center max-w-md py-12">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <FaExclamationTriangle className="text-6xl text-gray-300" />
        </div>
        
        {/* Error Code */}
        <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" className="w-full sm:w-auto">
              <FaHome className="mr-2" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="secondary" 
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default NotFound;
