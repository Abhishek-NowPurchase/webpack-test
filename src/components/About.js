import React from 'react';

function About() {
  return (
    <div className="about">
      <h2>About This App</h2>
      <div className="about-content">
        <p>
          This is a simple Hello World React application built with modern web technologies:
        </p>
        <ul>
          <li><strong>React 18:</strong> Latest version with concurrent features</li>
          <li><strong>Webpack 5:</strong> Modern bundler with Module Federation</li>
          <li><strong>React Router:</strong> Client-side routing</li>
          <li><strong>Module Federation:</strong> Micro-frontend architecture</li>
        </ul>
        <p>
          This app can be used as either a host application or a remote module in a 
          micro-frontend architecture powered by Webpack 5's Module Federation.
        </p>
      </div>
    </div>
  );
}

export default About; 