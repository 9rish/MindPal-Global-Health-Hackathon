import { useEffect, useState, createContext, useContext } from "react";
import { createBrowserRouter, Outlet, RouterProvider, Link, useRoutes, useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Error from "./pages/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import ProfileDetail from "./components/ProfileDetail";
import Loading from "./components/loading/Loading";
import GroupChatBox from "./components/chatComponents/GroupChatBox";
import NotificationBox from "./components/NotificationBox";
import socket from "./socket/socket.js";
import { MdOutlineThumbUp, MdOutlineThumbDown, MdKeyboardArrowDown, MdKeyboardArrowUp, MdNotificationsActive } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import handleScrollTop from "./utils/handleScrollTop";
import Logo from "./assets/logo.jpeg";
import {
	setHeaderMenu,
	setLoading,
	setNotificationBox,
	setProfileDetail,
} from "./redux/slices/conditionSlice";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUserCircleLight } from "react-icons/pi";
import Lottie from "lottie-react";
import DancingAnimation from "./assets/dancing.json";
import { addAuth } from "./redux/slices/authSlice";
import ForumApp from "./pages/ForumApp";
import { ForumContext } from "./contexts/ForumContext";

/**
 * Provides the forum state to all child components.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 */
const ForumProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const authUser = useSelector((store) => store?.auth);

  // Define actions that update the state
  const addTopic = (newTopic) => {
    setTopics(prevTopics => [newTopic, ...prevTopics]);
  };

  const addReply = (topicId, reply) => {
    setTopics(prevTopics => prevTopics.map(topic => 
      topic._id === topicId 
        ? { ...topic, replies: [...topic.replies, reply] }
        : topic
    ));
  };

  const updateLikes = (id, type, likes, topicId) => {
    setTopics(prevTopics => prevTopics.map(topic => {
      if (type === 'topic' && topic._id === id) {
        return { ...topic, likes: likes };
      } else if (type === 'reply' && topic._id === topicId) {
        return { 
          ...topic, 
          replies: topic.replies.map(reply => 
            reply._id === id ? { ...reply, likes: likes } : reply
          )
        };
      }
      return topic;
    }));
  };

  useEffect(() => {
    // Initial data fetch from Express API
    setLoading(true);
    
    // Temporary mock data for testing
    setTimeout(() => {
      const mockTopics = [
        {
          _id: '1',
          title: 'Test Topic',
          content: 'This is a test topic',
          author: { name: 'Test User' },
          category: 'General',
          likes: 0,
          replies: [],
          createdAt: new Date().toISOString()
        }
      ];
      console.log('Setting mock topics:', mockTopics);
      setTopics(mockTopics);
      setLoading(false);
    }, 1000);

    // Original socket code (commented for testing)
    /*
    socket.emit('getTopics'); // Ask server for topics

    socket.on('forumTopics', (topicsFromServer) => {
      console.log('Received topics:', topicsFromServer); // Debug log
      setTopics(topicsFromServer || []); // Ensure it's always an array
      setLoading(false);
    });
    */

    // Listen for real-time updates via Socket.IO
    socket.on('newPost', (newPost) => {
      console.log('New post received:', newPost); // Debug log
      addTopic(newPost);
    });

    socket.on('newReply', (data) => {
      console.log('New reply received:', data); // Debug log
      addReply(data.topicId, data.reply);
    });

    socket.on('updateLikes', (data) => {
      console.log('Likes updated:', data); // Debug log
      updateLikes(data.id, data.type, data.likes, data.topicId);
    });
    
    // Clean up on component unmount
    return () => {
      socket.off('forumTopics');
      socket.off('newPost');
      socket.off('newReply');
      socket.off('updateLikes');
    };
  }, []);

  const value = { 
    topics, 
    loading, 
    addTopic, 
    addReply, 
    updateLikes 
  };

  console.log('ForumProvider value:', value); // Debug log

  return (
    <ForumContext.Provider value={value}>
      {children}
    </ForumContext.Provider>
  );
};

const Applayout = () => {
    const [toastPosition, setToastPosition] = useState("bottom-left");
    const isProfileDetails = useSelector(
        (store) => store.condition.isProfileDetail
    );
    const isGroupChatBox = useSelector(
        (store) => store.condition.isGroupChatBox
    );
    const isNotificationBox = useSelector(
        (store) => store.condition.isNotificationBox
    );
    const isLoading = useSelector((store) => store.condition.isLoading);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 600) {
                setToastPosition("bottom-left");
            } else {
                setToastPosition("top-left");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    
    return (
        <div>
            <ToastContainer
                position={toastPosition}
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                stacked
                limit={3}
                toastStyle={{
                    border: "1px solid #dadadaaa",
                    textTransform: "capitalize",
                }}
            />
            <Header />
            <div className="h-16 md:h-20"></div>
            <div className="min-h-[85vh] p-2 sm:p-4 bg-gradient-to-tr from-[#A0E7FF] via-[#FFD6E0] to-[#FFB6C1]">
                <Outlet />
                {isProfileDetails && <ProfileDetail />}
                {isGroupChatBox && <GroupChatBox />}
                {isNotificationBox && <NotificationBox />}
            </div>
            {isLoading && <Loading />}
        </div>
    );
};

const routers = createBrowserRouter([
    {
        path: "/",
        element: <Applayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/signup",
                element: <SignUp />,
            },
            {
                path: "/signin",
                element: <SignIn />,
            },
            {
                path: "/forum/*",
                element: (
                    <ForumProvider>
                        <ForumApp />
                    </ForumProvider>
                ),
            },
            {
                path: "*",
                element: <Error />,
            },
        ],
        errorElement: <Error />,
    },
]);

function App() {
    return (
        <Provider store={store}>
            <RouterProvider router={routers} />
        </Provider>
    );
}

export default App;
