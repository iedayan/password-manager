import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import useResponsivePosition from '../hooks/useResponsivePosition';

const NotificationContainer = () => {
  // Use the custom hook to get a responsive position for the toast container.
  const position = useResponsivePosition();

  return (
    <ToastContainer
      position={position}
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="!text-sm"
      toastClassName="!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg !rounded-xl"
      progressClassName="!bg-gradient-to-r !from-blue-500 !to-purple-600"
    />
  );
};

export default NotificationContainer;