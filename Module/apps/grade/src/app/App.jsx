import React from "react";
import 'now-design-tokens/dist/css/variables.css';
import 'now-design-styles/dist/index.css';
import { ThemeProvider } from 'now-design-theme';
import { Button } from 'now-design-atoms';
import { TextInput } from 'now-design-molecules';
import { SystemSearchLine } from 'now-design-icons';

export const App = () => {
  return (
    <div style={{ 
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          marginBottom: '20px',
          color: 'var(--primary-color, #2196F3)'
        }}>
          Welcome to Grade Module
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <Button 
            onClick={() => alert('DS Button clicked!')}
            style={{ marginRight: '10px' }}
          >
            DS Button
          </Button>
          <Button 
            variant="secondary"
            onClick={() => alert('Secondary clicked!')}
          >
            Secondary
          </Button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <TextInput
            label="Grade Name"
            placeholder="Enter grade name..."
            value=""
            onChange={() => {}}
            icon={<SystemSearchLine />}
          />
        </div>
        
        <p style={{ 
          color: 'var(--text-secondary, #666)',
          fontSize: '14px'
        }}>
          This module is using Now Design System components with React 18 and Module Federation.
        </p>
      </div>
  );
};


