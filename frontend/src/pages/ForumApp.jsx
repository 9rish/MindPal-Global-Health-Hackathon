import { useState, useEffect, useContext } from 'react';
import { useRoutes, useParams, Link, useNavigate } from "react-router-dom";
import socket from '../socket/socket.js';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MdOutlineThumbUp } from "react-icons/md";
import { FaComments } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { ForumContext } from '../contexts/ForumContext';

// Component for a single topic post
const TopicPost = ({ topic }) => {
  const context = useContext(ForumContext);
  
  if (!context) {
    return <div>Loading topic...</div>;
  }

  const { updateLikes } = context;
  const authUser = useSelector((store) => store?.auth);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/forum/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: 'topic', id: topic._id, userId: authUser?._id })
      });
      if (response.ok) {
        const json = await response.json();
        updateLikes(json.data.id, 'topic', json.data.likes, null);
      } else {
        const json = await response.json();
        toast.error(json.message || "Failed to like post.");
      }
    } catch (error) {
      toast.error("Failed to connect to forum API.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-pink-200 hover:border-blue-300 transition-colors duration-200">
      <Link to={`/forum/${topic._id}`} className="block">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">{topic.title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Posted by {topic.author?.name || 'Unknown'} in <span className="text-pink-500">{topic.category}</span>
        </p>
        <p className="text-gray-800">{topic.content.substring(0, 150)}...</p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={handleLike} className="flex items-center text-gray-600 hover:text-blue-500 transition-colors duration-200">
            <MdOutlineThumbUp className="h-5 w-5 mr-1" />
            <span>{topic.likes || 0} Likes</span>
          </button>
          <div className="flex items-center text-gray-600">
            <FaComments className="h-4 w-4 mr-1" />
            <span>{topic.replies?.length || 0} Replies</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for the main forum page
const ForumPage = () => {
  const context = useContext(ForumContext);
  
  if (!context) {
    return (
      <div className="text-center text-red-500 text-xl">
        Forum context not available. Please check your setup.
      </div>
    );
  }

  const { topics, loading, addTopic } = context;
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('General');
  const [filterCategory, setFilterCategory] = useState('All');
  const authUser = useSelector((store) => store?.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTopicTitle && newTopicContent) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/forum`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newTopicTitle,
            content: newTopicContent,
            authorId: authUser?._id,
            category: newTopicCategory,
          })
        });
        const json = await response.json();
        if (response.ok) {
          addTopic(json.data);
          toast.success("New topic created!");
          setNewTopicTitle('');
          setNewTopicContent('');
          setNewTopicCategory('General');
        } else {
          toast.error(json.message || "Failed to create topic.");
        }
      } catch (error) {
        toast.error("Failed to connect to forum API.");
      }
    }
  };

  const categories = ['All', 'General', 'Feedback', 'Help', 'Announcements'];
  const filteredTopics = filterCategory === 'All' ? topics : topics.filter(topic => topic.category === filterCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Community Forum</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-pink-200">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Start a New Topic</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600">Title</label>
            <input
              id="title"
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-pink-50 border border-pink-200 rounded-md text-gray-800 shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-600">Content</label>
            <textarea
              id="content"
              rows="4"
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-pink-50 border border-pink-200 rounded-md text-gray-800 shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-600">Category</label>
            <select
              id="category"
              value={newTopicCategory}
              onChange={(e) => setNewTopicCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-pink-50 border border-pink-200 rounded-md text-gray-800 shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300"
            >
              {categories.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-pink-100"
          >
            Create Topic
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilterCategory(cat)} 
            className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
              filterCategory === cat
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-pink-50 text-gray-800 hover:bg-pink-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-600 text-xl">Loading forum topics...</div>
      ) : (
        <div className="space-y-6">
          {filteredTopics.length > 0 ? (
            filteredTopics.map(topic => (
              <TopicPost key={topic._id} topic={topic} />
            ))
          ) : (
            <div className="text-center text-gray-600 text-xl">No topics found in this category. Be the first to post!</div>
          )}
        </div>
      )}
    </div>
  );
};

// Component for a single topic view with replies
const TopicPage = () => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(true);
  const [newReplyContent, setNewReplyContent] = useState('');
  const authUser = useSelector((store) => store?.auth) || { _id: 'mock-user', name: 'Mock User' };
  const navigate = useNavigate();
  const context = useContext(ForumContext);

  useEffect(() => {
    if (!context) {
      console.error('ForumContext is undefined');
      toast.error('Forum context not available.');
      setTopicLoading(false);
      return;
    }

    const { topics } = context;
    const foundTopic = topics.find(t => t._id === topicId);
    if (foundTopic) {
      setTopic(foundTopic);
      setTopicLoading(false);
    } else {
      toast.error('Topic not found.');
      setTopic(null);
      setTopicLoading(false);
    }

    const handleNewReply = (data) => {
      if (data.topicId === topicId) {
        setTopic(prevTopic => ({
          ...prevTopic,
          replies: [...(prevTopic.replies || []), data.reply]
        }));
      }
    };
    socket.on('newReply', handleNewReply);
    return () => {
      socket.off('newReply', handleNewReply);
    };
  }, [topicId, context]);

  const handleLikeReply = async (replyId) => {
    setTopic(prevTopic => ({
      ...prevTopic,
      replies: prevTopic.replies.map(reply =>
        reply._id === replyId ? { ...reply, likes: (reply.likes || 0) + 1 } : reply
      )
    }));
    toast.success('Reply liked (mock action).');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!newReplyContent) return;
    const mockReply = {
      _id: `reply-${Date.now()}`,
      content: newReplyContent,
      author: { name: authUser.name, _id: authUser._id },
      likes: 0,
      createdAt: new Date().toISOString()
    };
    setTopic(prevTopic => ({
      ...prevTopic,
      replies: [...(prevTopic.replies || []), mockReply]
    }));
    context.addReply(topicId, mockReply);
    toast.success('Reply posted (mock action).');
    setNewReplyContent('');
  };

  if (topicLoading) {
    return (
      <div className="text-center text-gray-600 text-xl">Loading topic...</div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center text-gray-600 text-xl">
        Topic not found.
        <Link to="/forum" className="block mt-4 text-blue-500 hover:underline">Go back to forum</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-6">
      <Link to="/forum" className="text-blue-500 hover:underline mb-4 block">&larr; Back to all topics</Link>
      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-pink-200">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">{topic.title}</h1>
        <p className="text-sm text-gray-600 mb-4">
          Posted by {topic.author?.name || 'Unknown'} on {new Date(topic.createdAt).toLocaleString()}
        </p>
        <p className="text-gray-800 text-lg">{topic.content}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-pink-200">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Replies ({topic.replies?.length || 0})</h2>
        <form onSubmit={handleReplySubmit} className="mb-6">
          <textarea
            rows="3"
            value={newReplyContent}
            onChange={(e) => setNewReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 bg-pink-50 border border-pink-200 rounded-md text-gray-800 shadow-sm focus:outline-none focus:ring-blue-300 focus:border-blue-300 mb-2"
            required
          ></textarea>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-pink-100"
          >
            Post Reply
          </button>
        </form>
        <div className="space-y-4">
          {topic.replies && topic.replies.length > 0 ? (
            topic.replies.map(reply => (
              <div key={reply._id} className="bg-pink-50 p-4 rounded-xl border border-pink-200">
                <p className="text-gray-800 mb-2">{reply.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>By {reply.author?.name || 'Unknown'} on {new Date(reply.createdAt).toLocaleString()}</p>
                  <button onClick={() => handleLikeReply(reply._id)} className="flex items-center text-gray-600 hover:text-blue-500 transition-colors duration-200">
                    <MdOutlineThumbUp className="h-4 w-4 mr-1" />
                    <span>{reply.likes || 0} Likes</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No replies yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component with Forum Router
const ForumApp = () => {
    return useRoutes([
        {
            path: '/', 
            element: <ForumPage />,
        },
        {
            path: ':topicId', 
            element: <TopicPage />,
        },
    ]);
};

export default ForumApp;
