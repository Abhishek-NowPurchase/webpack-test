import React from 'react';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Hello World! 👋</h1>
        <p>Welcome to our React app built with Module Federation</p>
        <div className="features">
          <div className="feature">
            <h3>🚀 React 16.8</h3>
            <p>React with hooks support</p>
          </div>
          <div className="feature">
            <h3>🔄 Module Federation</h3>
            <p>Micro-frontend architecture</p>
          </div>
          <div className="feature">
            <h3>🛣️ React Router</h3>
            <p>Client-side routing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home; 